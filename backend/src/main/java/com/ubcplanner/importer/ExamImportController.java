package com.ubcplanner.importer;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/import")
@CrossOrigin // dev only
public class ExamImportController {
  private final ExamImportService service;

  public ExamImportController(ExamImportService service) {
    this.service = service;
  }

  @PostMapping("/exams")
  public ResponseEntity<?> importExams(
      @RequestParam String subject,
      @RequestParam String course,
      @RequestParam String term
  ) throws Exception {
    String msg = service.fetchEntry(subject, course, term);
    return ResponseEntity.ok(new Msg(msg));
  }

  record Msg(String message) {}
}
