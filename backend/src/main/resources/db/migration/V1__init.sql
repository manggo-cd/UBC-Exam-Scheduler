CREATE TABLE IF NOT EXISTS exam (
  id           BIGSERIAL PRIMARY KEY,
  campus       VARCHAR(1)  NOT NULL,     -- 'V' Vancouver, 'O' Okanagan
  subject      VARCHAR(32) NOT NULL,
  course       VARCHAR(32) NOT NULL,
  section      VARCHAR(32) NOT NULL,
  start_time   TIMESTAMPTZ NOT NULL,
  duration_min INTEGER     NOT NULL,
  building     VARCHAR(128),
  room         VARCHAR(64),

  CONSTRAINT uk_exam_unique UNIQUE (campus, subject, course, section, start_time)
);

-- Helpful filters
CREATE INDEX IF NOT EXISTS idx_exam_subject_course_start
  ON exam(subject, course, start_time);
