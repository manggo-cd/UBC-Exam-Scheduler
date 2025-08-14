// backend/src/main/java/com/ubcplanner/exams/ExamRepository.java
package com.ubcplanner.exams;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    // For GET filtering (used by ExamController)
    List<Exam> findByCampusIgnoreCaseOrderByStartTimeAsc(String campus);

    List<Exam> findByCampusIgnoreCaseAndSubjectIgnoreCaseOrderByStartTimeAsc(
            String campus, String subject);

    List<Exam> findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(
            String campus, String subject, String course);

    // For upsert during import (used by ExamImportService)
    Optional<Exam> findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseAndSectionIgnoreCaseAndStartTime(
            String campus, String subject, String course, String section, OffsetDateTime startTime);

    // (optional) exact-case campus variant, in case any existing code uses it
    Optional<Exam> findByCampusAndSubjectIgnoreCaseAndCourseIgnoreCaseAndSectionIgnoreCaseAndStartTime(
            String campus, String subject, String course, String section, OffsetDateTime startTime);
}
