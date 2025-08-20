package com.ubcplanner.exams;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for creating an Exam.
 * `campus` is optional; controller defaults to "V" (Vancouver) when absent/blank.
 */
public record ExamRequest(
        @NotBlank String subject,
        @NotBlank String course,
        @NotBlank String section,
        @NotBlank String startTime, // ISO-8601 (e.g., 2025-12-15T09:00:00Z or 2025-12-15T09:00:00-08:00)
        @NotNull Integer durationMin,
        String building,
        String room,
        String campus // optional; if null/blank -> "V"
) {}