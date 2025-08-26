package com.ubcplanner.exams;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    // ---------- List filters ----------
    List<Exam> findByCampusIgnoreCaseOrderByStartTimeAsc(String campus);

    List<Exam> findByCampusIgnoreCaseAndSubjectIgnoreCaseOrderByStartTimeAsc(
            String campus, String subject
    );

    List<Exam> findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(
            String campus, String subject, String course
    );

    // ---------- Upsert lookup (includes campus) ----------
    Optional<Exam> findByCampusAndSubjectIgnoreCaseAndCourseIgnoreCaseAndSectionIgnoreCaseAndStartTime(
            String campus, String subject, String course, String section, OffsetDateTime startTime
    );

    // ---------- Catalog lookups for dropdowns (meta endpoints) ----------
    @Query("""
           select distinct upper(e.subject)
           from Exam e
           where lower(e.campus) = lower(:campus)
           order by upper(e.subject)
           """)
    List<String> findDistinctSubjects(@Param("campus") String campus);

    @Query("""
           select distinct e.course
           from Exam e
           where lower(e.campus) = lower(:campus)
             and lower(e.subject) = lower(:subject)
           order by e.course
           """)
    List<String> findDistinctCourses(@Param("campus") String campus,
                                     @Param("subject") String subject);

    @Query("""
           select distinct e.section
           from Exam e
           where lower(e.campus) = lower(:campus)
             and lower(e.subject) = lower(:subject)
             and lower(e.course)  = lower(:course)
           order by e.section
           """)
    List<String> findDistinctSections(@Param("campus") String campus,
                                      @Param("subject") String subject,
                                      @Param("course") String course);

    // ---------- (Optional) Back-compat aliases ----------
    // If any existing code calls your old names, keep these delegating defaults.
    // Remove them if not needed.

    @Deprecated
    default List<String> distinctSubjects(String campus) {
        return findDistinctSubjects(campus);
    }

    @Deprecated
    default List<String> distinctCourses(String campus, String subject) {
        return findDistinctCourses(campus, subject);
    }

    @Deprecated
    default List<String> distinctSections(String campus, String subject, String course) {
        return findDistinctSections(campus, subject, course);
    }
}