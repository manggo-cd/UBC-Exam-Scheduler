package com.ubcplanner.exams;

import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin
public class ExamSearchController {

    private final ExamRepository repo;

    public ExamSearchController(ExamRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/search")
    public Page<Exam> search(
            @RequestParam(defaultValue = "V") String campus,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startTime,asc") String sort
    ) {
        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 200), sortObj);

        if (section != null && !section.isBlank()) {
            return repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseAndSectionIgnoreCase(
                    campus, subject, course, section, pageable);
        }
        if (course != null && !course.isBlank()) {
            return repo.findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCase(
                    campus, subject, course, pageable);
        }
        if (subject != null && !subject.isBlank()) {
            return repo.findByCampusIgnoreCaseAndSubjectIgnoreCase(campus, subject, pageable);
        }
        return repo.findByCampusIgnoreCase(campus, pageable);
    }

    private Sort parseSort(String sort) {
        // e.g. "startTime,asc" or "startTime,desc"
        String[] parts = sort.split(",", 2);
        String prop = (parts.length > 0 && !parts[0].isBlank()) ? parts[0].trim() : "startTime";
        Sort.Direction dir = (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(dir, prop);
    }
}