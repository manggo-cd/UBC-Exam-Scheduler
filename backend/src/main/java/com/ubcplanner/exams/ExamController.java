package com.ubcplanner.exams;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin
public class ExamController {

    private final ExamRepository repo;

    public ExamController(ExamRepository repo) {
        this.repo = repo;
    }

    // GET /api/exams?campus=V&subject=CPSC&course=221
    // campus defaults to "V" (Vancouver)
    @GetMapping
    public List<Exam> list(
            @RequestParam(defaultValue = "V") String campus,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String course) {

        String c = normalizeCampus(campus);

        if (subject != null && course != null) {
            return repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(
                    c, subject, course);
        } else if (subject != null) {
            return repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseOrderByStartTimeAsc(c, subject);
        }
        return repo.findByCampusIgnoreCaseOrderByStartTimeAsc(c);
    }

    // POST /api/exams
    @PostMapping
    public Exam create(@Valid @RequestBody ExamRequest req) {
        Exam e = new Exam();
        e.setCampus(normalizeCampus(req.campus())); // defaults to "V" if null/blank
        e.setSubject(req.subject());
        e.setCourse(req.course());
        e.setSection(req.section());
        e.setStartTime(OffsetDateTime.parse(req.startTime())); // must be ISO-8601
        e.setDurationMin(req.durationMin());
        e.setBuilding(req.building());
        e.setRoom(req.room());
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }

    private String normalizeCampus(String campus) {
        if (campus == null || campus.isBlank()) return "V"; // default Vancouver
        String c = campus.trim();
        if (c.equalsIgnoreCase("Vancouver") || c.equalsIgnoreCase("V")) return "V";
        // Allow others to pass through unchanged (e.g., "O" if you ever add Okanagan)
        return c;
    }
}
