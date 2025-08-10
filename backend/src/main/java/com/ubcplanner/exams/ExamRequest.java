package com.ubcplanner.exams;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExamRequest(
    @NotBlank String subject,
    @NotBlank String course,
    @NotBlank String section,
    @NotBlank String startTime,
    @NotNull  Integer durationMin,
    String building,
    String room
) {}
