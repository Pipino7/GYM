/**
 * migrate.js — Crea el schema completo de la base de datos
 * Usado por Docker para crear las tablas sin necesitar Prisma CLI
 * Idempotente: no falla si las tablas ya existen
 */
const { Client } = require('pg');

const SCHEMA_SQL = `
-- ============================================
-- Schema completo: GYM Training App
-- ============================================

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO roles (nombre) VALUES ('profesor'), ('alumno') ON CONFLICT DO NOTHING;

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON usuarios (rol_id);

-- Pautas
CREATE TABLE IF NOT EXISTS pautas (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mes VARCHAR(50) NOT NULL,
    anio INTEGER NOT NULL,
    descripcion TEXT,
    calentamiento TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);
DO $$ BEGIN
  ALTER TABLE pautas ADD CONSTRAINT pautas_profesor_id_fkey
    FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_pautas_profesor ON pautas (profesor_id);

-- Ejercicios
CREATE TABLE IF NOT EXISTS ejercicios (
    id SERIAL PRIMARY KEY,
    pauta_id INTEGER REFERENCES pautas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    series_repeticiones VARCHAR(255),
    cargas_kg TEXT,
    observaciones TEXT,
    video_url TEXT,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- Students
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    usuario_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    goal TEXT,
    peso_kg DECIMAL(5,2),
    estatura_cm DECIMAL(5,1),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DO $$ BEGIN
  ALTER TABLE students ADD CONSTRAINT students_usuario_id_fkey
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_students_profesor ON students (profesor_id);

-- Routine Assignments
CREATE TABLE IF NOT EXISTS routine_assignments (
    id SERIAL PRIMARY KEY,
    routine_id INTEGER NOT NULL REFERENCES pautas(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    starts_at TIMESTAMP(6),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_assignment ON routine_assignments (routine_id, student_id, status);
CREATE INDEX IF NOT EXISTS idx_routine_assignments_student_status ON routine_assignments (student_id, status);

-- Workout Logs
CREATE TABLE IF NOT EXISTS workout_logs (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assignment_id INTEGER NOT NULL REFERENCES routine_assignments(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    notes TEXT,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workout_logs_student_date ON workout_logs (student_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_assignment ON workout_logs (assignment_id);

-- Exercise Logs
CREATE TABLE IF NOT EXISTS exercise_logs (
    id SERIAL PRIMARY KEY,
    workout_log_id INTEGER NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES ejercicios(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps_completed INTEGER,
    weight_kg DECIMAL(6,2),
    rpe INTEGER,
    notes TEXT,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DO $$ BEGIN
  ALTER TABLE exercise_logs ADD CONSTRAINT exercise_logs_rpe_check
    CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE exercise_logs ADD CONSTRAINT exercise_logs_reps_check
    CHECK (reps_completed IS NULL OR reps_completed >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE exercise_logs ADD CONSTRAINT exercise_logs_weight_check
    CHECK (weight_kg IS NULL OR weight_kg >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise_id ON exercise_logs (exercise_id);
`;

const migrate = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('📦 Ejecutando schema de base de datos...');
    await client.query(SCHEMA_SQL);
    console.log('✅ Schema aplicado correctamente');
  } catch (error) {
    console.error('❌ Error en migraciones:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

migrate();
