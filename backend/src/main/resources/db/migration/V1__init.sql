CREATE TABLE IF NOT EXISTS exam (
  id           BIGSERIAL PRIMARY KEY,
  subject      VARCHAR(16)  NOT NULL,
  course       VARCHAR(32)  NOT NULL,
  section      VARCHAR(32)  NOT NULL,
  start_time   TIMESTAMPTZ  NOT NULL,
  duration_min INTEGER      NOT NULL,
  building     VARCHAR(64),
  room         VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_exam_subject_course_time
  ON exam(subject, course, start_time);
