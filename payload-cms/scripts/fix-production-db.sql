-- ==========================================================================
-- Production DB Fix: Add template_categories support
-- Run via ECS exec → psql
-- ==========================================================================

-- 1. Create template_categories table
CREATE TABLE IF NOT EXISTS "template_categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "label" varchar,
  "slug" varchar NOT NULL,
  "order" numeric DEFAULT 0,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- Unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS "template_categories_slug_idx" ON "template_categories" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "template_categories_updated_at_idx" ON "template_categories" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "template_categories_created_at_idx" ON "template_categories" USING btree ("created_at");

-- 2. Create template_categories_locales table (for localized 'name' field)
CREATE TABLE IF NOT EXISTS "template_categories_locales" (
  "name" varchar,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);

ALTER TABLE "template_categories_locales"
  DROP CONSTRAINT IF EXISTS "template_categories_locales_parent_id_fk";
ALTER TABLE "template_categories_locales"
  ADD CONSTRAINT "template_categories_locales_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "template_categories"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "template_categories_locales_locale_parent_id_unique"
  ON "template_categories_locales" USING btree ("_locale", "_parent_id");

-- 3. Add template_categories_id column to payload_locked_documents_rels
ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "template_categories_id" integer;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_template_categories_id_idx"
  ON "payload_locked_documents_rels" USING btree ("template_categories_id");

ALTER TABLE "payload_locked_documents_rels"
  DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_template_categories_fk";
ALTER TABLE "payload_locked_documents_rels"
  ADD CONSTRAINT "payload_locked_documents_rels_template_categories_fk"
  FOREIGN KEY ("template_categories_id") REFERENCES "template_categories"("id") ON DELETE CASCADE;

-- 4. Add PRODUCT to reusable_blocks block_type enum (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'PRODUCT'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_reusable_blocks_block_type')
  ) THEN
    ALTER TYPE "enum_reusable_blocks_block_type" ADD VALUE 'PRODUCT';
  END IF;
END$$;

-- 5. Change document_templates.category from enum to integer (relationship to template_categories)
-- First drop the old default
ALTER TABLE "document_templates" ALTER COLUMN "category" DROP DEFAULT;
-- Change column type: cast existing enum values to NULL (they can't map to IDs automatically)
ALTER TABLE "document_templates" ALTER COLUMN "category" TYPE integer USING NULL;

-- Done! After this, restart Payload and push:true will handle any remaining schema sync.
-- The onInit hook will seed default template categories.

SELECT 'SUCCESS: All schema fixes applied' AS result;
