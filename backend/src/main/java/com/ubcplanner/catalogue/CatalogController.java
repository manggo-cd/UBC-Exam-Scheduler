package com.ubcplanner.catalog;

import com.ubcplanner.exams.ExamRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin
public class CatalogController {

  private final ExamRepository repo;

  public CatalogController(ExamRepository repo) {
    this.repo = repo;
  }

  // GET /api/catalog/subjects?campus=V
  @GetMapping("/subjects")
  public List<String> subjects(@RequestParam(defaultValue = "V") String campus) {
    return repo.distinctSubjects(campus);
  }

  // GET /api/catalog/courses?subject=CPSC&campus=V
  @GetMapping("/courses")
  public List<String> courses(
      @RequestParam String subject,
      @RequestParam(defaultValue = "V") String campus
  ) {
    return repo.distinctCourses(campus, subject);
  }

  // GET /api/catalog/sections?subject=CPSC&course=221&campus=V
  @GetMapping("/sections")
  public List<String> sections(
      @RequestParam String subject,
      @RequestParam String course,
      @RequestParam(defaultValue = "V") String campus
  ) {
    return repo.distinctSections(campus, subject, course);
  }
}
