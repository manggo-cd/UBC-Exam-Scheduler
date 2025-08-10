package com.ubcplanner.exams;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
  List<Exam> findBySubjectIgnoreCaseOrderByStartTimeAsc(String subject);
  List<Exam> findBySubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(String subject, String course);
}
