package com.ubcplanner.importer;

import com.ubcplanner.exams.Exam;
import com.ubcplanner.exams.ExamRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ExamImportService {

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
  public ImportSummary importBySubjectCourseTerm(String subject, String course, String term, boolean dryRun) throws Exception {
    Document doc = Jsoup.connect(searchUrl)
        .userAgent("UBC-Exam-Scheduler/1.0 (+https://github.com/manggo-cd/UBC-Exam-Scheduler)")
        .referrer("https://students.ubc.ca/")
        .timeout(15_000)
        .get();

    Element table = findExamTable(doc);
    if (table == null) return new ImportSummary(0, 0, 0, List.of());

    List<ParsedExam> parsed = parseRows(table, subject, course, term);

    int inserted = 0, updated = 0, skipped = 0;
    if (!dryRun) {
      for (ParsedExam p : parsed) {
        if (p.startTime() == null) { skipped++; continue; }

        var existing = repo.findByCampusAndSubjectIgnoreCaseAndCourseIgnoreCaseAndSectionIgnoreCaseAndStartTime(
            "V", p.subject(), p.course(), p.section(), p.startTime()
        );

        if (existing.isPresent()) {
          Exam e = existing.get();
          boolean changed = false;
          if (!Objects.equals(e.getDurationMin(), p.durationMin())) { e.setDurationMin(p.durationMin()); changed = true; }
          if (!Objects.equals(e.getBuilding(), p.building()))       { e.setBuilding(p.building()); changed = true; }
          if (!Objects.equals(e.getRoom(), p.room()))               { e.setRoom(p.room()); changed = true; }
          if (changed) { repo.save(e); updated++; } else { skipped++; }
        } else {
          Exam e = new Exam();
          e.setCampus("V");
          e.setSubject(p.subject());
          e.setCourse(p.course());
          e.setSection(p.section());
          e.setStartTime(p.startTime());
          e.setDurationMin(p.durationMin());
          e.setBuilding(p.building());
          e.setRoom(p.room());
          repo.save(e);
          inserted++;
        }
      }
    }

    return new ImportSummary(inserted, updated, skipped, parsed.stream().limit(3).toList());
  }

  private Element findExamTable(Document doc) {
    for (Element t : doc.select("table")) {
      String header = t.select("thead th, tr th").text().toLowerCase(Locale.ROOT);
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

      OffsetDateTime start = parseDateTimeVancouver(dateStr, timeStr, term);
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
      if (t.contains("exam"))     map.putIfAbsent("date", i);
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

    DateTimeFormatter dateFmt1 = DateTimeFormatter.ofPattern("MMM d, uuuu", Locale.CANADA);
    DateTimeFormatter dateFmt2 = DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.CANADA);

    LocalDate date;
    try { date = LocalDate.parse(dateStr, dateFmt1); }
    catch (Exception ex1) {
      try { date = LocalDate.parse(dateStr, dateFmt2); }
      catch (Exception ex2) { return null; }
    }

    LocalTime time;
    try {
      time = LocalTime.parse(timeStr.toUpperCase(Locale.ROOT).replace(" ", ""));
    } catch (Exception ex) {
      try {
        time = LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("h:mm a", Locale.CANADA));
      } catch (Exception ex2) {
        return null;
      }
    }

    return ZonedDateTime.of(date, time, ZoneId.of("America/Vancouver")).toOffsetDateTime();
  }

  private Integer parseDuration(String durationCell, String timeCell) {
    if (durationCell != null) {
      String digits = durationCell.replaceAll("[^0-9]", "");
      if (!digits.isEmpty()) return Integer.parseInt(digits);
    }
    return (timeCell != null) ? 120 : null;
  }
}
