package com.ubcplanner.importer;

import com.ubcplanner.importer.ExamCsvImportService;
import com.ubcplanner.importer.ExamImportService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/import")
@CrossOrigin
public class ExamImportController {

    private final ExamImportService service;
    private final ExamCsvImportService csvService;

    public ExamImportController(ExamImportService service,
                                ExamCsvImportService csvService) {
        this.service = service;
        this.csvService = csvService;
    }

    @PostMapping(path = "/exams", produces = MediaType.APPLICATION_JSON_VALUE)
    public ExamImportService.ImportSummary importByQuery(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String term,
            @RequestParam(defaultValue = "V") String campus,
            @RequestParam(defaultValue = "true") boolean dryRun,
            @RequestParam(defaultValue = "static") String source // static | live
    ) throws Exception {
        return service.importBySubjectCourseTerm(subject, course, term, campus, dryRun, source);
    }

    @PostMapping(
            path = "/exams/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ExamImportService.ImportSummary importFromUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "V") String campus,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String term,
            @RequestParam(defaultValue = "true") boolean dryRun
    ) throws Exception {
        try (var in = file.getInputStream()) {
            return service.importFromUploadedHtml(in, campus, subject, course, term, dryRun);
        }
    }

    @PostMapping(
            path = "/exams/csv",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ExamCsvImportService.CsvImportSummary importFromCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "V") String campus,
            @RequestParam(defaultValue = "true") boolean dryRun
    ) throws Exception {
        try (var in = file.getInputStream()) {
            return csvService.importFromCsv(in, campus, dryRun);
        }
    }
}
