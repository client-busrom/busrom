#!/bin/sh
set -e

# Create the CDP database if it does not exist.
# PostgreSQL runs this script on the first container startup when the data
# directory is empty.

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-'SQL'
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'busrom_cdp') THEN
      CREATE DATABASE busrom_cdp;
    END IF;
  END
  $$;
SQL
