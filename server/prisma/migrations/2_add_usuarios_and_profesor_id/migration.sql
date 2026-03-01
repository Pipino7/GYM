-- CreateTable: roles
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique role name
CREATE UNIQUE INDEX "roles_nombre_key" ON "public"."roles"("nombre");

-- Seed default roles
INSERT INTO "public"."roles" ("nombre") VALUES ('profesor'), ('alumno')
ON CONFLICT DO NOTHING;

-- CreateTable: usuarios
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "apellido" VARCHAR(255) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique email
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- FK: usuarios -> roles
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON UPDATE NO ACTION;

-- Add profesor_id to pautas (nullable first for migration)
ALTER TABLE "public"."pautas" ADD COLUMN "profesor_id" INTEGER;

-- Add profesor_id to students (nullable first for migration)
ALTER TABLE "public"."students" ADD COLUMN "profesor_id" INTEGER;

-- Add student physical fields
ALTER TABLE "public"."students" ADD COLUMN IF NOT EXISTS "peso_kg" DECIMAL(5,2);
ALTER TABLE "public"."students" ADD COLUMN IF NOT EXISTS "estatura_cm" DECIMAL(5,1);

-- Insert default profesor (Camila Aguayo) — placeholder hash, seed.js handles real hash
INSERT INTO "public"."usuarios" ("email", "password_hash", "nombre", "apellido", "rol_id")
VALUES ('camila@gym.cl', '$2a$10$placeholder', 'Camila', 'Aguayo', (SELECT "id" FROM "public"."roles" WHERE "nombre" = 'profesor'))
ON CONFLICT DO NOTHING;

-- Assign existing pautas and students to the first profesor
UPDATE "public"."pautas" SET "profesor_id" = (SELECT "id" FROM "public"."usuarios" LIMIT 1) WHERE "profesor_id" IS NULL;
UPDATE "public"."students" SET "profesor_id" = (SELECT "id" FROM "public"."usuarios" LIMIT 1) WHERE "profesor_id" IS NULL;

-- Now make profesor_id NOT NULL
ALTER TABLE "public"."pautas" ALTER COLUMN "profesor_id" SET NOT NULL;
ALTER TABLE "public"."students" ALTER COLUMN "profesor_id" SET NOT NULL;

-- Add foreign keys
ALTER TABLE "public"."pautas" ADD CONSTRAINT "pautas_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."students" ADD CONSTRAINT "students_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_pautas_profesor" ON "public"."pautas" ("profesor_id");
CREATE INDEX IF NOT EXISTS "idx_students_profesor" ON "public"."students" ("profesor_id");
CREATE INDEX IF NOT EXISTS "idx_usuarios_rol_id" ON "public"."usuarios" ("rol_id");

-- Add usuario_id (cuenta de login) to students
ALTER TABLE "public"."students" ADD COLUMN IF NOT EXISTS "usuario_id" INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS "students_usuario_id_key" ON "public"."students" ("usuario_id");
ALTER TABLE "public"."students" ADD CONSTRAINT "students_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
