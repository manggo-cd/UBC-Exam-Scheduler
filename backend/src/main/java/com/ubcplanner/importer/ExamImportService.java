package com.ubcplanner.importer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ubcplanner.exams.Exam;
import com.ubcplanner.exams.ExamRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ExamImportService {

  private static final Logger log = LoggerFactory.getLogger(ExamImportService.class);

  @Value("${ubc.exams.searchUrl}")
  private String searchUrl;

  private final ExamRepository repo;

  public ExamImportService(ExamRepository repo) {
    this.repo = repo;
  }

  public record ParsedExam(
      String subject, String course, String section,
      OffsetDateTime startTime, Integer durationMin,
      String building, String room) {}

  public record ImportSummary(int inserted, int updated, int skipped, List<ParsedExam> samples) {}

  @Transactional
  public ImportSummary importBySubjectCourseTerm(
      String subject,
      String course,
      String term,
      String campus,
      boolean dryRun,
      String source
  ) throws Exception {
    Document doc;
    if ("static".equalsIgnoreCase(source)) {
      ClassPathResource res = new ClassPathResource("sample/exams.html");
      if (!res.exists()) {
        return new ImportSummary(0, 0, 0, List.of());
      }
      try (InputStream in = res.getInputStream()) {
        doc = Jsoup.parse(in, "UTF-8", "");
      }
    } else {
      doc = Jsoup.connect(searchUrl)
          .userAgent("UBC-Exam-Scheduler/1.0 (+https://github.com/manggo-cd/UBC-Exam-Scheduler)")
          .referrer("https://students.ubc.ca/")
          .timeout(15_000)
          .get();
    }
    return importFromDocument(doc, normalizeCampus(campus), subject, course, term, dryRun);
  }

  @Transactional
  public ImportSummary importFromUploadedHtml(
      InputStream in,
      String campus,
      String subject,
      String course,
      String term,
      boolean dryRun
  ) throws Exception {
    Document doc = Jsoup.parse(in, "UTF-8", "");
    return importFromDocument(doc, normalizeCampus(campus), subject, course, term, dryRun);
  }

  private ImportSummary importFromDocument(
      Document doc,
      String campus,
      String subject,
      String course,
      String term,
      boolean dryRun
  ) {
    Element table = findExamTable(doc);
    if (table == null) {
      return new ImportSummary(0, 0, 0, List.of());
    }

    List<ParsedExam> parsed = parseRows(table, subject, course, term);

    int inserted = 0, updated = 0, skipped = 0;
    for (ParsedExam p : parsed) {
      if (p.startTime() == null) { skipped++; continue; }

      var existing = repo.findByCampusAndSubjectIgnoreCaseAndCourseIgnoreCaseAndSectionIgnoreCaseAndStartTime(
          campus, p.subject(), p.course(), p.section(), p.startTime()
      );

      if (existing.isPresent()) {
        Exam e = existing.get();
        boolean changed = false;
        if (!Objects.equals(e.getDurationMin(), p.durationMin())) { changed = true; }
        if (!Objects.equals(e.getBuilding(), p.building()))       { changed = true; }
        if (!Objects.equals(e.getRoom(), p.room()))               { changed = true; }

        if (changed) {
          updated++;
          if (!dryRun) {
            e.setDurationMin(p.durationMin());
            e.setBuilding(p.building());
            e.setRoom(p.room());
            repo.save(e);
          }
        } else {
          skipped++;
        }
      } else {
        inserted++;
        if (!dryRun) {
          Exam e = new Exam();
          e.setCampus(campus);
          e.setSubject(p.subject());
          e.setCourse(p.course());
          e.setSection(p.section());
          e.setStartTime(p.startTime());
          e.setDurationMin(p.durationMin());
          e.setBuilding(p.building());
          e.setRoom(p.room());
          repo.save(e);
        }
      }
    }

    List<ParsedExam> samples = parsed.stream().limit(3).toList();
    return new ImportSummary(inserted, updated, skipped, samples);
  }

  private Element findExamTable(Document doc) {
    for (Element t : doc.select("table")) {
      Elements ths = t.select("thead th, tr th");
      String header = ths.text().toLowerCase(Locale.ROOT);
      if (header.contains("course") && header.contains("section") &&
          (header.contains("exam") || header.contains("date")) &&
          (header.contains("time") || header.contains("start"))) {
        return t;
      }
    }
    return null;
  }

  private List<ParsedExam> parseRows(Element table, String subjectFilter, String courseFilter, String term) {
    Map<String, Integer> col = mapHeaderIndexes(table);

    List<ParsedExam> out = new ArrayList<>();
    for (Element tr : table.select("tbody tr")) {
      Elements tds = tr.select("td");
      if (tds.isEmpty()) continue;

      String courseStr = textAt(tds, col, "course");
      String section   = textAt(tds, col, "section");
      String dateStr   = textAt(tds, col, "date");
      String timeStr   = textAt(tds, col, "time");
      String building  = textAt(tds, col, "building");
      String room      = textAt(tds, col, "room");
      String duration  = textAt(tds, col, "duration");

      if (courseStr == null || section == null) continue;

      String[] parts = courseStr.trim().split("\\s+");
      String subject = parts.length > 0 ? parts[0] : "";
      String course  = parts.length > 1 ? parts[1] : "";

      if (subjectFilter != null && !subject.equalsIgnoreCase(subjectFilter)) continue;
      if (courseFilter  != null && !course.equalsIgnoreCase(courseFilter))   continue;

      log.info("DEBUG dateStr='{}' timeStr='{}'", dateStr, timeStr);
      OffsetDateTime start = parseDateTimeVancouver(dateStr, timeStr, term);
      log.info("DEBUG start='{}'", start);
      Integer durMin = parseDuration(duration, timeStr);

      out.add(new ParsedExam(subject, course, section, start, durMin, emptyToNull(building), emptyToNull(room)));
    }
    return out;
  }

  private Map<String, Integer> mapHeaderIndexes(Element table) {
    Map<String, Integer> map = new HashMap<>();
    Elements headerCells = table.select("thead th");
    if (headerCells.isEmpty()) {
      Element firstRow = table.selectFirst("tr");
      if (firstRow != null) headerCells = firstRow.select("th,td");
    }
    for (int i = 0; i < headerCells.size(); i++) {
      String t = headerCells.get(i).text().toLowerCase(Locale.ROOT);
      if (t.contains("course"))   map.put("course", i);
      if (t.contains("section"))  map.put("section", i);
      if (t.contains("date"))     map.put("date", i);
      if (t.contains("exam"))     map.putIfAbsent("date", i);   // “Exam Date”
      if (t.contains("time"))     map.put("time", i);
      if (t.contains("building")) map.put("building", i);
      if (t.contains("room"))     map.put("room", i);
      if (t.contains("duration")) map.put("duration", i);
    }
    return map;
  }

  private String textAt(Elements tds, Map<String,Integer> col, String key) {
    Integer idx = col.get(key);
    if (idx == null || idx >= tds.size()) return null;
    String s = tds.get(idx).text();
    return s != null ? s.trim() : null;
  }

  private static String emptyToNull(String s) {
    return (s == null || s.isBlank()) ? null : s;
  }

  private OffsetDateTime parseDateTimeVancouver(String dateStr, String timeStr, String term) {
    if (dateStr == null || timeStr == null) return null;
  
    String d = normalizeWs(dateStr);
    String t = normalizeWs(timeStr);
  
    // If time is a range like "9:00 AM - 12:00 PM", take the start
    int dash = t.indexOf('-');
    if (dash > 0) t = t.substring(0, dash).trim();
  
    // Extract date like "Dec 15, 2025" (month abbr, day, year)
    java.util.regex.Matcher dm = DATE_RE.matcher(d);
    if (!dm.find()) {
      log.warn("DATE PARSE FAIL: '{}'", d);
      return null;
    }
    String monAbbr = dm.group(1);
    int day  = Integer.parseInt(dm.group(2));
    int year = Integer.parseInt(dm.group(3));
    int month = monthFromAbbr(monAbbr);
  
    // Extract time like "9:00 AM" or "15:30"
    java.util.regex.Matcher tm = TIME_RE.matcher(t);
    if (!tm.find()) {
      log.warn("TIME PARSE FAIL: '{}'", t);
      return null;
    }
    int hour   = Integer.parseInt(tm.group(1));
    int minute = Integer.parseInt(tm.group(2));
    String ampm = tm.group(3); // may be null for 24h format
  
    if (ampm != null) {
      if (ampm.equalsIgnoreCase("PM") && hour != 12) hour += 12;
      if (ampm.equalsIgnoreCase("AM") && hour == 12) hour = 0;
    }
  
    LocalDate date = LocalDate.of(year, month, day);
    LocalTime time = LocalTime.of(hour, minute);
    return ZonedDateTime.of(date, time, ZoneId.of("America/Vancouver")).toOffsetDateTime();
  }
  
  // --- helpers and patterns ---
  
  private static final java.util.regex.Pattern DATE_RE =
      java.util.regex.Pattern.compile("(?i)\\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\b\\s+(\\d{1,2}),\\s*(\\d{4})");
  
  private static final java.util.regex.Pattern TIME_RE =
      java.util.regex.Pattern.compile("(\\d{1,2}):(\\d{2})\\s*(AM|PM|am|pm)?");
  
  // Replace NBSPs and narrow NBSPs, then trim
  private static String normalizeWs(String s) {
    return s.replace('\u00A0', ' ')
            .replace('\u202F', ' ')
            .trim();
  }
  
  private static int monthFromAbbr(String abbr) {
    String m = abbr.substring(0, 3).toLowerCase(Locale.ROOT);
    return switch (m) {
      case "jan" -> 1; case "feb" -> 2; case "mar" -> 3; case "apr" -> 4;
      case "may" -> 5; case "jun" -> 6; case "jul" -> 7; case "aug" -> 8;
      case "sep" -> 9; case "oct" -> 10; case "nov" -> 11; case "dec" -> 12;
      default -> throw new IllegalArgumentException("Unknown month: " + abbr);
    };
  }

  private Integer parseDuration(String durationCell, String timeCell) {
    if (durationCell != null) {
      String digits = durationCell.replaceAll("[^0-9]", "");
      if (!digits.isEmpty()) return Integer.parseInt(digits);
    }
    return (timeCell != null) ? 120 : null;
  }

  private String normalizeCampus(String campus) {
    if (campus == null || campus.isBlank()) return "V";
    String c = campus.trim();
    if (c.equalsIgnoreCase("Vancouver") || c.equalsIgnoreCase("V")) return "V";
    return c;
  }
}
