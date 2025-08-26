package com.ubcplanner.exams;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/meta")
@CrossOrigin
public class ExamMetaController {

    private final ExamRepository repo;

    public ExamMetaController(ExamRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/subjects")
    public List<String> subjects(@RequestParam(defaultValue = "V") String campus) {
        return repo.findDistinctSubjects(campus);
    }

    @GetMapping("/courses")
    public List<String> courses(@RequestParam String subject,
                                @RequestParam(defaultValue = "V") String campus) {
        return repo.findDistinctCourses(campus, subject);
    }

    @GetMapping("/sections")
    public List<String> sections(@RequestParam String subject,
                                 @RequestParam String course,
                                 @RequestParam(defaultValue = "V") String campus) {
        return repo.findDistinctSections(campus, subject, course);
    }
}