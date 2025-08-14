package com.ubcplanner.ics;

import com.ubcplanner.exams.Exam;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class IcsService {

    private static final DateTimeFormatter ICS_TS =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");

    public byte[] generate(List<Exam> exams) {
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//UBC Planner//Exams//EN\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");

        OffsetDateTime nowUtc = OffsetDateTime.now(ZoneOffset.UTC);
        for (Exam e : exams) {
            // Fallbacks
            int durationMin = (e.getDurationMin() != null) ? e.getDurationMin() : 120;

            OffsetDateTime startUtc = e.getStartTime().withOffsetSameInstant(ZoneOffset.UTC);
            OffsetDateTime endUtc   = startUtc.plusMinutes(durationMin);

            String summary = (e.getSubject() + " " + e.getCourse() + " " + e.getSection() + " Final Exam").trim();
            String location = buildLocation(e.getBuilding(), e.getRoom());
            String uid = "exam-" + e.getId() + "-" + startUtc.toEpochSecond() + "@ubcplanner";

            sb.append("BEGIN:VEVENT\r\n");
            sb.append("UID:").append(escape(uid)).append("\r\n");
            sb.append("DTSTAMP:").append(ICS_TS.format(nowUtc)).append("\r\n");
            sb.append("DTSTART:").append(ICS_TS.format(startUtc)).append("\r\n");
            sb.append("DTEND:").append(ICS_TS.format(endUtc)).append("\r\n");
            sb.append("SUMMARY:").append(escape(summary)).append("\r\n");
            if (!location.isBlank()) {
                sb.append("LOCATION:").append(escape(location)).append("\r\n");
            }
            // Nice to have a description with campus
            sb.append("DESCRIPTION:")
              .append(escape("Campus: " + nullSafe(e.getCampus()) +
                              "\\nCourse: " + e.getSubject() + " " + e.getCourse() +
                              "\\nSection: " + e.getSection()))
              .append("\r\n");
            sb.append("END:VEVENT\r\n");
        }

        sb.append("END:VCALENDAR\r\n");
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String buildLocation(String building, String room) {
        String b = nullSafe(building);
        String r = nullSafe(room);
        if (!b.isBlank() && !r.isBlank()) return b + " " + r;
        if (!b.isBlank()) return b;
        if (!r.isBlank()) return r;
        return "";
    }

    private static String nullSafe(String s) {
        return (s == null) ? "" : s;
    }

    // Minimal escaping for ICS text fields
    private static String escape(String s) {
        return s.replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\n", "\\n");
    }
}
