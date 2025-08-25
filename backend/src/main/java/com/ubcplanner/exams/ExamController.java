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

  @GetMapping
  public List<Exam> list(
      @RequestParam(defaultValue = "V") String campus,
      @RequestParam(required = false) String subject,
      @RequestParam(required = false) String course) {

    String c = normalizeCampus(campus);

    if (subject != null && course != null) {
      return repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(c, subject, course);
    } else if (subject != null) {
      return repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseOrderByStartTimeAsc(c, subject);
    }
    return repo.findByCampusIgnoreCaseOrderByStartTimeAsc(c);
  }

  // Catalog endpoints for dropdowns
  // GET /api/exams/catalog/subjects?campus=V
  @GetMapping("/catalog/subjects")
  public List<String> subjects(@RequestParam(defaultValue = "V") String campus) {
    return repo.distinctSubjects(normalizeCampus(campus));
  }

  // GET /api/exams/catalog/courses?campus=V&subject=CPSC
  @GetMapping("/catalog/courses")
  public List<String> courses(@RequestParam(defaultValue = "V") String campus,
                              @RequestParam String subject) {
    return repo.distinctCourses(normalizeCampus(campus), subject);
  }

  @GetMapping("/catalog/sections")
  public List<String> sections(@RequestParam(defaultValue = "V") String campus,
                               @RequestParam String subject,
                               @RequestParam String course) {
    return repo.distinctSections(normalizeCampus(campus), subject, course);
  }

  // POST /api/exams
  @PostMapping
  public Exam create(@Valid @RequestBody ExamRequest req) {
    Exam e = new Exam();
    e.setCampus(normalizeCampus(req.campus()));
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
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }

  private String normalizeCampus(String campus) {
    if (campus == null || campus.isBlank()) return "V";
    String c = campus.trim();
    if (c.equalsIgnoreCase("Vancouver") || c.equalsIgnoreCase("V")) return "V";
    return c;
  }
}