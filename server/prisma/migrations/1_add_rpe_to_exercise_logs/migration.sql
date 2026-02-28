-- Add RPE (Rate of Perceived Exertion) column to exercise_logs
ALTER TABLE "public"."exercise_logs" ADD COLUMN IF NOT EXISTS "rpe" INTEGER;

-- Add check constraint for RPE range (1-10)
ALTER TABLE "public"."exercise_logs" ADD CONSTRAINT "exercise_logs_rpe_check" CHECK ("rpe" IS NULL OR ("rpe" >= 1 AND "rpe" <= 10));

-- Add check constraint for non-negative values
ALTER TABLE "public"."exercise_logs" ADD CONSTRAINT "exercise_logs_reps_check" CHECK ("reps_completed" IS NULL OR "reps_completed" >= 0);
ALTER TABLE "public"."exercise_logs" ADD CONSTRAINT "exercise_logs_weight_check" CHECK ("weight_kg" IS NULL OR "weight_kg" >= 0);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_exercise_logs_exercise_id" ON "public"."exercise_logs" ("exercise_id");
CREATE INDEX IF NOT EXISTS "idx_workout_logs_student_date" ON "public"."workout_logs" ("student_id", "date");
CREATE INDEX IF NOT EXISTS "idx_workout_logs_assignment" ON "public"."workout_logs" ("assignment_id");
CREATE INDEX IF NOT EXISTS "idx_routine_assignments_student_status" ON "public"."routine_assignments" ("student_id", "status");
