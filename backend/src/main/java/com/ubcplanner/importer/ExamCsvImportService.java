package com.ubcplanner.importer;

import com.ubcplanner.exams.Exam;
import com.ubcplanner.exams.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.*;
import java.util.Objects;

@Service
public class ExamCsvImportService {

    private final ExamRepository repo;

    @Autowired
    public ExamCsvImportService(ExamRepository repo) {
        this.repo = repo;
    }

    public record CsvImportSummary(int inserted, int updated, int skipped) {}

    @Transactional
    public CsvImportSummary importFromCsv(InputStream in,
                                          String campus,
                                          boolean dryRun) throws Exception {
        int inserted = 0, updated = 0, skipped = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(in))) {
            String line = reader.readLine(); // skip header
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length < 6) continue;
                String subject  = parts[0].trim();
                String course   = parts[1].trim();
                String section  = parts[2].trim();
                String dateStr  = parts[3].trim(); // e.g. 2025-04-23
                String timeStr  = parts[4].trim(); // e.g. 15:30
                String duration = parts[5].trim(); // e.g. 2h30 or 150
                String building = parts.length > 6 ? parts[6].trim() : "";
                String room     = parts.length > 7 ? parts[7].trim() : "";

                OffsetDateTime startTime = parseDateTime(dateStr, timeStr);
                Integer durationMin = parseDuration(duration);

                var existing = repo.findByCampusAndSubjectIgnoreCaseAndCourseIgnoreCaseAndSectionIgnoreCaseAndStartTime(
                        campus, subject, course, section, startTime);

                if (existing.isPresent()) {
                    Exam e = existing.get();
                    boolean changed = false;
                    if (!Objects.equals(e.getDurationMin(), durationMin)) { changed = true; }
                    if (!Objects.equals(e.getBuilding(), building))       { changed = true; }
                    if (!Objects.equals(e.getRoom(), room))               { changed = true; }

                    if (changed && !dryRun) {
                        e.setDurationMin(durationMin);
                        e.setBuilding(building);
                        e.setRoom(room);
                        repo.save(e);
                    }
                    updated++;
                } else {
                    if (!dryRun) {
                        Exam e = new Exam();
                        e.setCampus(campus);
                        e.setSubject(subject);
                        e.setCourse(course);
                        e.setSection(section);
                        e.setStartTime(startTime);
                        e.setDurationMin(durationMin);
                        e.setBuilding(building);
                        e.setRoom(room);
                        repo.save(e);
                    }
                    inserted++;
                }
            }
        }
        return new CsvImportSummary(inserted, updated, skipped);
    }

    // Convert "YYYY-MM-DD" + "HH:MM" into an OffsetDateTime in America/Vancouver
    private OffsetDateTime parseDateTime(String date, String time) {
        LocalDate d = LocalDate.parse(date);
        LocalTime t = LocalTime.parse(time);
        ZonedDateTime zdt = ZonedDateTime.of(d, t, ZoneId.of("America/Vancouver"));
        return zdt.toOffsetDateTime();
    }

    // Convert strings like "2h30" or "150" into minutes
    private Integer parseDuration(String duration) {
        String cleaned = duration.toLowerCase().replaceAll("\\s+", "");
        if (cleaned.contains("h")) {
            String[] parts = cleaned.split("h");
            int hours = Integer.parseInt(parts[0]);
            int minutes = 0;
            if (parts.length > 1 && !parts[1].isEmpty()) {
                minutes = Integer.parseInt(parts[1].replace("m", ""));
            }
            return hours * 60 + minutes;
        }
        return Integer.parseInt(cleaned.replace("m", ""));
    }
}
