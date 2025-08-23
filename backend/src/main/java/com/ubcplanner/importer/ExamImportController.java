package com.ubcplanner.importer;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/import")
@CrossOrigin
public class ExamImportController {

  private final ExamImportService service;

  public ExamImportController(ExamImportService service) {
    this.service = service;
  }

  // Existing subject/course/term importer (kept if you already had it)
  @PostMapping("/exams")
  public ExamImportService.ImportSummary importByQuery(
      @RequestParam(required = false) String subject,
      @RequestParam(required = false) String course,
      @RequestParam(required = false) String term,
      @RequestParam(defaultValue = "true") boolean dryRun
  ) throws Exception {
    return service.importBySubjectCourseTerm(subject, course, term, dryRun);
  }

  // NEW: Upload HTML file (multipart) and import
  @PostMapping(path = "/exams/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ExamImportService.ImportSummary importFromUpload(
      @RequestPart("file") MultipartFile file,
      @RequestParam(defaultValue = "V") String campus,
      @RequestParam(required = false) String subject,
      @RequestParam(required = false) String course,
      @RequestParam(required = false) String term,
      @RequestParam(defaultValue = "false") boolean dryRun
  ) throws Exception {
    try (var in = file.getInputStream()) {
      return service.importFromUploadedHtml(in, campus, subject, course, term, dryRun);
    }
  }
}
