package com.ubcplanner.exams;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin // dev only; we'll lock this down later
public class ExamController {
  private final ExamRepository repo;
  
  @Autowired
  public ExamController(ExamRepository repo) { 
    this.repo = repo; 
  }

  @GetMapping
  public List<Exam> list() {
    return repo.findAll();
  }

  @PostMapping
  public Exam create(@RequestBody Exam e) {
    return repo.save(e);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }
}
