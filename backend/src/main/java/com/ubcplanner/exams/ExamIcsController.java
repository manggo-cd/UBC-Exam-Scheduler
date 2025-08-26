package com.ubcplanner.exams;

import com.ubcplanner.ics.IcsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin // dev convenience
public class ExamIcsController {

    private final ExamRepository repo;
    private final IcsService icsService;

    public ExamIcsController(ExamRepository repo, IcsService icsService) {
        this.repo = repo;
        this.icsService = icsService;
    }

    /**
     * Download exams as an .ics file.
     *
     * Two modes:
     *  1) By IDs:    GET /api/exams/ics?ids=1,2,3
     *  2) By filter: GET /api/exams/ics?campus=V&subject=CPSC&course=221&section=101&filename=cpsc221.ics
     */
    @GetMapping(value = "/ics", produces = "text/calendar")
    public ResponseEntity<byte[]> downloadIcs(
            @RequestParam(required = false) String ids,
            @RequestParam(defaultValue = "V") String campus,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "exams.ics") String filename
    ) {
        final List<Exam> exams;

        // Mode 1: explicit IDs
        if (StringUtils.hasText(ids)) {
            List<Long> idList = Arrays.stream(ids.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::valueOf)
                    .collect(Collectors.toList());

            exams = repo.findAllById(idList).stream()
                    .sorted(Comparator.comparing(Exam::getStartTime,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();

        // Mode 2: filter by campus / subject / course / section
        } else {
            if (StringUtils.hasText(section)) {
                exams = repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(campus, subject, course)
                        .stream()
                        .filter(e -> e.getSection() != null && e.getSection().equalsIgnoreCase(section))
                        .toList();
            } else if (StringUtils.hasText(course)) {
                exams = repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(campus, subject, course);
            } else if (StringUtils.hasText(subject)) {
                exams = repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseOrderByStartTimeAsc(campus, subject);
            } else {
                exams = repo.findByCampusIgnoreCaseOrderByStartTimeAsc(campus);
            }
        }

        // Build payload
        byte[] payload;
        if (exams.isEmpty()) {
            payload = ("BEGIN:VCALENDAR\r\n" +
                       "PRODID:-//UBC-Exam-Scheduler//EN\r\n" +
                       "VERSION:2.0\r\n" +
                       "END:VCALENDAR\r\n").getBytes(StandardCharsets.UTF_8);
        } else {
            payload = icsService.generate(exams);
        }

        // Sanitize filename and ensure .ics extension
        String safeFilename = filename.replaceAll("[\\r\\n\"]", "").trim();
        if (!safeFilename.toLowerCase(Locale.ROOT).endsWith(".ics")) {
            safeFilename += ".ics";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFilename + "\"")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(payload);
    }
}