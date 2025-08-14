package com.ubcplanner.importer;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/import")
@CrossOrigin
public class ExamImportController {

  private final ExamImportService service;

  public ExamImportController(ExamImportService service) {
    this.service = service;
  }

  // POST /admin/import/exams?subject=CPSC&course=221&term=2025W&dryRun=true
  @PostMapping("/exams")
  public ExamImportService.ImportSummary importExams(
      @RequestParam(required = false) String subject,
      @RequestParam(required = false) String course,
      @RequestParam(defaultValue = "2025W") String term,
      @RequestParam(defaultValue = "true") boolean dryRun
  ) throws Exception {
    return service.importBySubjectCourseTerm(subject, course, term, dryRun);
  }
}
