package com.ubcplanner.exams;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

  // Existing list filters
  List<Exam> findByCampusIgnoreCaseOrderByStartTimeAsc(String campus);
  List<Exam> findByCampusIgnoreCaseAndSubjectIgnoreCaseOrderByStartTimeAsc(String campus, String subject);
  List<Exam> findByCampusIgnoreCaseAndSubjectIgnoreCaseAndCourseIgnoreCaseOrderByStartTimeAsc(String campus, String subject, String course);

  // Upsert lookup (includes campus)
  Optional<Exam> findByCampusAndSubjectIgnoreCaseAndCourseIgnoreCaseAndSectionIgnoreCaseAndStartTime(
      String campus, String subject, String course, String section, OffsetDateTime startTime
  );

  // NEW: distinct catalogs (used by frontend)
  @Query("""
         select distinct upper(e.subject) from Exam e
         where lower(e.campus) = lower(:campus)
         order by upper(e.subject)
         """)
  List<String> distinctSubjects(@Param("campus") String campus);

  @Query("""
         select distinct e.course from Exam e
         where lower(e.campus) = lower(:campus)
           and lower(e.subject) = lower(:subject)
         order by e.course
         """)
  List<String> distinctCourses(@Param("campus") String campus, @Param("subject") String subject);

  @Query("""
         select distinct e.section from Exam e
         where lower(e.campus) = lower(:campus)
           and lower(e.subject) = lower(:subject)
           and lower(e.course)  = lower(:course)
         order by e.section
         """)
  List<String> distinctSections(@Param("campus") String campus, @Param("subject") String subject, @Param("course") String course);
}
