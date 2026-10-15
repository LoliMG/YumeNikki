import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Database Schema Integrity', () => {
  test('schema.sql existe y define todas las tablas del modelo relacional', () => {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    assert.ok(fs.existsSync(schemaPath), 'schema.sql debe existir');

    const content = fs.readFileSync(schemaPath, 'utf8');
    const requiredTables = [
      'users',
      'tags',
      'dreams',
      'dream_images',
      'day_notes',
      'menstrual_periods',
      'synchronicities',
      'symbol_glossary'
    ];

    for (const table of requiredTables) {
      assert.ok(
        content.includes(`CREATE TABLE IF NOT EXISTS "${table}"`) || content.includes(`CREATE TABLE IF NOT EXISTS ${table}`),
        `schema.sql debe contener la definición de la tabla ${table}`
      );
    }
  });

  test('schema.sql incluye extensión pg_trgm e índices de aceleración', () => {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const content = fs.readFileSync(schemaPath, 'utf8');

    assert.ok(content.includes('CREATE EXTENSION IF NOT EXISTS "pg_trgm"'));
    assert.ok(content.includes('idx_dreams_title_trgm'));
    assert.ok(content.includes('idx_dreams_content_trgm'));
  });
});
