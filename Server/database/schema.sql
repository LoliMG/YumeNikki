-- ----------------------------------------------------------------------------
-- ESQUEMA DE BASE DE DATOS: YUMENIKKI (PostgreSQL)
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(60) NOT NULL UNIQUE,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "avatar_url" TEXT NULL,
  "timezone" VARCHAR(64) DEFAULT 'Europe/Madrid' NOT NULL,
  "gender" VARCHAR(20) DEFAULT 'other' NOT NULL,
  "track_cycle" BOOLEAN DEFAULT FALSE NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tabla de Etiquetas (Personalizables por usuario con archivado)
CREATE TABLE IF NOT EXISTS "tags" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(80) NOT NULL,
  "initials" VARCHAR(6) NOT NULL,
  "color" VARCHAR(20) NOT NULL,
  "is_default" BOOLEAN DEFAULT FALSE NOT NULL,
  "is_archived" BOOLEAN DEFAULT FALSE NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "uq_user_tag_name" UNIQUE ("user_id", "name")
);

-- 3. Tabla de Sueños
CREATE TABLE IF NOT EXISTS "dreams" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NULL,
  "dream_date" DATE NOT NULL,
  "dream_time" TIME NOT NULL,
  "tag_id" INTEGER NULL REFERENCES "tags"("id") ON DELETE SET NULL,
  "content" TEXT NULL,
  "symbolisms" TEXT NULL,
  "characters" TEXT NULL,
  "places" TEXT NULL,
  "notes" TEXT NULL,
  "moon_phase_name" VARCHAR(50) NOT NULL,
  "moon_phase_emoji" VARCHAR(10) NOT NULL,
  "moon_zodiac_sign" VARCHAR(50) NOT NULL,
  "moon_zodiac_symbol" VARCHAR(10) NOT NULL,
  "lucidity_level" SMALLINT DEFAULT 1,
  "clarity_level" SMALLINT DEFAULT 3,
  "spiritual_type" VARCHAR(50) DEFAULT 'standard',
  "target_intention" TEXT NULL,
  "intention_met" BOOLEAN DEFAULT FALSE,
  "subconscious_message" TEXT NULL,
  "waking_action" TEXT NULL,
  "induction_practices" TEXT[] NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "chk_title_or_content" CHECK (
    ("title" IS NOT NULL AND TRIM("title") <> '') OR
    ("content" IS NOT NULL AND TRIM("content") <> '')
  )
);

-- 4. Tabla de Imágenes de Sueños
CREATE TABLE IF NOT EXISTS "dream_images" (
  "id" SERIAL PRIMARY KEY,
  "dream_id" INTEGER NOT NULL REFERENCES "dreams"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "file_path" TEXT NOT NULL,
  "original_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Tabla de Notas del Día (Calendario)
CREATE TABLE IF NOT EXISTS "day_notes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "note_date" DATE NOT NULL,
  "content" TEXT NOT NULL,
  "is_bleeding" BOOLEAN DEFAULT FALSE NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Tabla de Periodos Menstruales (Historial real de sangrados)
CREATE TABLE IF NOT EXISTS "menstrual_periods" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "start_date" DATE NOT NULL,
  "end_date" DATE NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "uq_user_period_start" UNIQUE ("user_id", "start_date")
);

-- 7. Tabla de Sincronías (Ecos de Sueños en Vigilia)
CREATE TABLE IF NOT EXISTS "synchronicities" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "dream_id" INTEGER NOT NULL REFERENCES "dreams"("id") ON DELETE CASCADE,
  "event_date" DATE NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Tabla de Glosario Personal de Símbolos y Arquetipos
CREATE TABLE IF NOT EXISTS "symbol_glossary" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "symbol_name" VARCHAR(100) NOT NULL,
  "archetype" VARCHAR(100) NULL,
  "personal_meaning" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "uq_user_symbol" UNIQUE ("user_id", "symbol_name")
);

-- Índices de aceleración para consultas y aislamiento
CREATE INDEX IF NOT EXISTS "idx_dreams_user_date_time" ON "dreams"("user_id", "dream_date" DESC, "dream_time" ASC);
CREATE INDEX IF NOT EXISTS "idx_tags_user" ON "tags"("user_id");
CREATE INDEX IF NOT EXISTS "idx_dream_images_dream_user" ON "dream_images"("dream_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_day_notes_user_date" ON "day_notes"("user_id", "note_date");
CREATE INDEX IF NOT EXISTS "idx_menstrual_periods_user_dates" ON "menstrual_periods"("user_id", "start_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_synchronicities_user" ON "synchronicities"("user_id", "event_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_synchronicities_dream" ON "synchronicities"("dream_id");
CREATE INDEX IF NOT EXISTS "idx_symbol_glossary_user" ON "symbol_glossary"("user_id", "symbol_name" ASC);

-- Índices GIN trigrama (pg_trgm) para acelerar búsquedas ILIKE en texto libre
CREATE INDEX IF NOT EXISTS "idx_dreams_title_trgm" ON "dreams" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_dreams_content_trgm" ON "dreams" USING gin ("content" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_dreams_symbolisms_trgm" ON "dreams" USING gin ("symbolisms" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_dreams_characters_trgm" ON "dreams" USING gin ("characters" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_dreams_places_trgm" ON "dreams" USING gin ("places" gin_trgm_ops);

