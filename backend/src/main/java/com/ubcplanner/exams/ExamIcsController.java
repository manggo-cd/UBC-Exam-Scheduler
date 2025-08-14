package com.ubcplanner.exams;

import com.ubcplanner.ics.IcsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
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
     * Download selected exams as an .ics file.
     * Usage: GET /api/exams/ics?ids=1,2,3
     */
    @GetMapping(value = "/ics", produces = "text/calendar")
    public ResponseEntity<byte[]> downloadIcs(@RequestParam String ids) {
        if (!StringUtils.hasText(ids)) {
            return ResponseEntity.badRequest()
                    .body("BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n".getBytes(StandardCharsets.UTF_8));
        }

        List<Long> idList = Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .collect(Collectors.toList());

        List<Exam> exams = repo.findAllById(idList);
        byte[] bytes = icsService.generate(exams);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=exams.ics")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(bytes);
    }
}
