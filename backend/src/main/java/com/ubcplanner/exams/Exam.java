package com.ubcplanner.exams;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
public class Exam {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false) private String subject;   // e.g., CPSC
  @Column(nullable = false) private String course;    // e.g., 221
  @Column(nullable = false) private String section;   // e.g., 101

  @Column(nullable = false) private OffsetDateTime startTime;
  @Column(nullable = false) private Integer durationMin;

  private String building;
  private String room;

  // getters/setters
  public Long getId() { return id; }
  public String getSubject() { return subject; }
  public void setSubject(String subject) { this.subject = subject; }
  public String getCourse() { return course; }
  public void setCourse(String course) { this.course = course; }
  public String getSection() { return section; }
  public void setSection(String section) { this.section = section; }
  public OffsetDateTime getStartTime() { return startTime; }
  public void setStartTime(OffsetDateTime startTime) { this.startTime = startTime; }
  public Integer getDurationMin() { return durationMin; }
  public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }
  public String getBuilding() { return building; }
  public void setBuilding(String building) { this.building = building; }
  public String getRoom() { return room; }
  public void setRoom(String room) { this.room = room; }
}
