package com.ubcplanner.exams;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin // dev only
public class ExamController {

  private final ExamRepository repo;

  public ExamController(ExamRepository repo) { this.repo = repo; }

  // GET /api/exams?subject=CPSC&course=221
  @GetMapping
  public List<Exam> list(@RequestParam(required = false) String subject,
                         @RequestParam(required = false) String course) {
    if (subject != null && course != null) {
      return repo.findBySubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(subject, course);
    } else if (subject != null) {
      return repo.findBySubjectIgnoreCaseOrderByStartTimeAsc(subject);
    }
    return repo.findAll();
  }

  // POST /api/exams (validated)
  @PostMapping
  public Exam create(@Valid @RequestBody ExamRequest req) {
    System.out.println(">>> CREATE @ /api/exams (validated)"); // proves this handler is hit
    Exam e = new Exam();
    e.setSubject(req.subject());
    e.setCourse(req.course());
    e.setSection(req.section());
    e.setStartTime(OffsetDateTime.parse(req.startTime()));
    e.setDurationMin(req.durationMin());
    e.setBuilding(req.building());
    e.setRoom(req.room());
    return repo.save(e);
  }

  // DELETE /api/exams/{id}
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
