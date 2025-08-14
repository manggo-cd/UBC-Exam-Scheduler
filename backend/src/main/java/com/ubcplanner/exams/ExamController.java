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

  public ExamController(ExamRepository repo) { this.repo = repo; }

  // GET /api/exams?subject=CPSC&course=221&campus=Vancouver
  @GetMapping
  public List<Exam> list(
      @RequestParam(defaultValue = "Vancouver") String campus,
      @RequestParam(required = false) String subject,
      @RequestParam(required = false) String course) {

    if (subject != null && course != null) {
      return repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(
          campus, subject, course);
    } else if (subject != null) {
      return repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseOrderByStartTimeAsc(campus, subject);
    }
    return repo.findByCampusIgnoreCaseOrderByStartTimeAsc(campus);
  }

  // POST /api/exams  (body = ExamRequest without campus)
  @PostMapping
  public Exam create(@Valid @RequestBody ExamRequest req) {
    Exam e = new Exam();
    e.setSubject(req.subject());
    e.setCourse(req.course());
    e.setSection(req.section());
    e.setStartTime(OffsetDateTime.parse(req.startTime()));
    e.setDurationMin(req.durationMin());
    e.setBuilding(req.building());
    e.setRoom(req.room());
    e.setCampus("Vancouver");                 // <-- important
    return repo.save(e);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }
}
