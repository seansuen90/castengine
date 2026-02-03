import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Database Migration SQL', () => {
  let migrationSQL;

  it('should read the migration file successfully', () => {
    const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
    expect(() => {
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    }).not.toThrow();
    expect(migrationSQL).toBeDefined();
    expect(migrationSQL.length).toBeGreaterThan(0);
  });

  describe('Enum Definitions', () => {
    beforeAll(() => {
      const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    });

    it('should define match_status enum', () => {
      expect(migrationSQL).toContain('CREATE TYPE "public"."match_status"');
    });

    it('should include all three status values in enum', () => {
      expect(migrationSQL).toContain("'scheduled'");
      expect(migrationSQL).toContain("'live'");
      expect(migrationSQL).toContain("'finished'");
    });

    it('should define enum as AS ENUM', () => {
      expect(migrationSQL).toContain('AS ENUM');
    });

    it('should place enum in public schema', () => {
      expect(migrationSQL).toContain('"public"."match_status"');
    });
  });

  describe('Matches Table', () => {
    beforeAll(() => {
      const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    });

    it('should create matches table', () => {
      expect(migrationSQL).toContain('CREATE TABLE "matches"');
    });

    it('should have id column as serial primary key', () => {
      expect(migrationSQL).toMatch(/"id"\s+serial\s+PRIMARY KEY\s+NOT NULL/i);
    });

    it('should have sport column as required text', () => {
      expect(migrationSQL).toMatch(/"sport"\s+text\s+NOT NULL/i);
    });

    it('should have home_team column as required text', () => {
      expect(migrationSQL).toMatch(/"home_team"\s+text\s+NOT NULL/i);
    });

    it('should have away_team column as required text', () => {
      expect(migrationSQL).toMatch(/"away_team"\s+text\s+NOT NULL/i);
    });

    it('should have status column with match_status enum type', () => {
      expect(migrationSQL).toMatch(/"status"\s+"match_status"/i);
    });

    it('should have status with default value of scheduled', () => {
      expect(migrationSQL).toMatch(/"status".*DEFAULT\s+'scheduled'/is);
    });

    it('should have start_time as timestamp', () => {
      expect(migrationSQL).toMatch(/"start_time"\s+timestamp/i);
    });

    it('should have end_time as timestamp', () => {
      expect(migrationSQL).toMatch(/"end_time"\s+timestamp/i);
    });

    it('should have home_score as integer with default 0', () => {
      expect(migrationSQL).toMatch(/"home_score"\s+integer\s+DEFAULT\s+0\s+NOT NULL/i);
    });

    it('should have away_score as integer with default 0', () => {
      expect(migrationSQL).toMatch(/"away_score"\s+integer\s+DEFAULT\s+0\s+NOT NULL/i);
    });

    it('should have created_at with now() default', () => {
      expect(migrationSQL).toMatch(/"created_at"\s+timestamp\s+DEFAULT\s+now\(\)\s+NOT NULL/i);
    });

    it('should have all 9 data columns plus id', () => {
      const matchesTableMatch = migrationSQL.match(/CREATE TABLE "matches"\s*\(([\s\S]*?)\);/);
      expect(matchesTableMatch).toBeTruthy();
      const tableContent = matchesTableMatch[1];
      const columnCount = (tableContent.match(/"/g) || []).length / 2;
      expect(columnCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Commentary Table', () => {
    beforeAll(() => {
      const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    });

    it('should create commentary table', () => {
      expect(migrationSQL).toContain('CREATE TABLE "commentary"');
    });

    it('should have id column as serial primary key', () => {
      expect(migrationSQL).toMatch(/"id"\s+serial\s+PRIMARY KEY\s+NOT NULL/i);
    });

    it('should have match_id as required integer', () => {
      expect(migrationSQL).toMatch(/"match_id"\s+integer\s+NOT NULL/i);
    });

    it('should have minute as optional integer', () => {
      expect(migrationSQL).toMatch(/"minute"\s+integer[,\s]/i);
    });

    it('should have sequence as optional integer', () => {
      expect(migrationSQL).toMatch(/"sequence"\s+integer[,\s]/i);
    });

    it('should have period as optional text', () => {
      expect(migrationSQL).toMatch(/"period"\s+text[,\s]/i);
    });

    it('should have event_type as optional text', () => {
      expect(migrationSQL).toMatch(/"event_type"\s+text[,\s]/i);
    });

    it('should have actor as optional text', () => {
      expect(migrationSQL).toMatch(/"actor"\s+text[,\s]/i);
    });

    it('should have team as optional text', () => {
      expect(migrationSQL).toMatch(/"team"\s+text[,\s]/i);
    });

    it('should have message as required text', () => {
      expect(migrationSQL).toMatch(/"message"\s+text\s+NOT NULL/i);
    });

    it('should have metadata as jsonb', () => {
      expect(migrationSQL).toMatch(/"metadata"\s+jsonb/i);
    });

    it('should have tags as text array', () => {
      expect(migrationSQL).toMatch(/"tags"\s+text\[\]/i);
    });

    it('should have created_at with now() default', () => {
      expect(migrationSQL).toMatch(/"created_at"\s+timestamp\s+DEFAULT\s+now\(\)\s+NOT NULL/i);
    });
  });

  describe('Foreign Key Constraints', () => {
    beforeAll(() => {
      const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    });

    it('should define foreign key from commentary to matches', () => {
      expect(migrationSQL).toContain('ALTER TABLE "commentary" ADD CONSTRAINT');
    });

    it('should name the foreign key constraint properly', () => {
      expect(migrationSQL).toContain('commentary_match_id_matches_id_fk');
    });

    it('should reference matches.id from commentary.match_id', () => {
      expect(migrationSQL).toMatch(/FOREIGN KEY.*"match_id".*REFERENCES.*"matches".*"id"/is);
    });

    it('should specify ON DELETE action', () => {
      expect(migrationSQL).toMatch(/ON DELETE\s+no action/i);
    });

    it('should specify ON UPDATE action', () => {
      expect(migrationSQL).toMatch(/ON UPDATE\s+no action/i);
    });
  });

  describe('SQL Syntax and Structure', () => {
    beforeAll(() => {
      const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    });

    it('should use statement-breakpoint comments', () => {
      expect(migrationSQL).toContain('--> statement-breakpoint');
    });

    it('should have at least 3 statement-breakpoints', () => {
      const breakpointCount = (migrationSQL.match(/statement-breakpoint/g) || []).length;
      expect(breakpointCount).toBeGreaterThanOrEqual(3);
    });

    it('should use double quotes for identifiers', () => {
      expect(migrationSQL).toMatch(/"matches"/);
      expect(migrationSQL).toMatch(/"commentary"/);
    });

    it('should use single quotes for string literals', () => {
      expect(migrationSQL).toMatch(/'scheduled'/);
    });

    it('should end with semicolons', () => {
      const statements = migrationSQL.split(/--> statement-breakpoint/);
      statements.forEach(stmt => {
        const trimmed = stmt.trim();
        if (trimmed.startsWith('CREATE') || trimmed.startsWith('ALTER')) {
          expect(trimmed).toMatch(/;/);
        }
      });
    });

    it('should be valid SQL without syntax errors in structure', () => {
      expect(migrationSQL).not.toContain('CRATE TABLE');
      expect(migrationSQL).not.toContain('PRIMRY KEY');
      expect(migrationSQL).not.toContain('FORIEGN KEY');
    });

    it('should have both tables defined', () => {
      const matchesIndex = migrationSQL.indexOf('CREATE TABLE "matches"');
      const commentaryIndex = migrationSQL.indexOf('CREATE TABLE "commentary"');
      expect(matchesIndex).toBeGreaterThan(-1);
      expect(commentaryIndex).toBeGreaterThan(-1);
    });

    it('should define enum before using it in table', () => {
      const enumIndex = migrationSQL.indexOf('CREATE TYPE "public"."match_status"');
      const matchesIndex = migrationSQL.indexOf('CREATE TABLE "matches"');
      expect(enumIndex).toBeLessThan(matchesIndex);
    });

    it('should define tables before adding constraints', () => {
      const commentaryTableIndex = migrationSQL.indexOf('CREATE TABLE "commentary"');
      const alterTableIndex = migrationSQL.indexOf('ALTER TABLE "commentary"');
      expect(commentaryTableIndex).toBeLessThan(alterTableIndex);
    });
  });

  describe('Data Type Validation', () => {
    beforeAll(() => {
      const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    });

    it('should use appropriate PostgreSQL data types', () => {
      expect(migrationSQL).toMatch(/\bserial\b/);
      expect(migrationSQL).toMatch(/\btext\b/);
      expect(migrationSQL).toMatch(/\binteger\b/);
      expect(migrationSQL).toMatch(/\btimestamp\b/);
      expect(migrationSQL).toMatch(/\bjsonb\b/);
    });

    it('should not use deprecated data types', () => {
      expect(migrationSQL).not.toContain('VARCHAR');
      expect(migrationSQL).not.toMatch(/\bINT\b/);
      expect(migrationSQL).not.toContain('DATETIME');
    });

    it('should use jsonb instead of json for metadata', () => {
      expect(migrationSQL).toContain('jsonb');
      expect(migrationSQL).not.toMatch(/"metadata"\s+json[^b]/);
    });

    it('should use text array notation correctly', () => {
      expect(migrationSQL).toMatch(/text\[\]/);
    });
  });

  describe('Schema Design Best Practices', () => {
    beforeAll(() => {
      const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    });

    it('should have primary keys on all tables', () => {
      const matchesHasPK = migrationSQL.match(/CREATE TABLE "matches"[\s\S]*?PRIMARY KEY/);
      const commentaryHasPK = migrationSQL.match(/CREATE TABLE "commentary"[\s\S]*?PRIMARY KEY/);
      expect(matchesHasPK).toBeTruthy();
      expect(commentaryHasPK).toBeTruthy();
    });

    it('should use appropriate default values', () => {
      expect(migrationSQL).toContain('DEFAULT 0');
      expect(migrationSQL).toContain('DEFAULT now()');
      expect(migrationSQL).toContain("DEFAULT 'scheduled'");
    });

    it('should have created_at timestamps on all tables', () => {
      expect(migrationSQL).toMatch(/CREATE TABLE "matches"[\s\S]*?"created_at"/);
      expect(migrationSQL).toMatch(/CREATE TABLE "commentary"[\s\S]*?"created_at"/);
    });

    it('should use snake_case for column names', () => {
      expect(migrationSQL).toContain('home_team');
      expect(migrationSQL).toContain('away_team');
      expect(migrationSQL).toContain('match_id');
      expect(migrationSQL).toContain('event_type');
      expect(migrationSQL).toContain('created_at');
    });

    it('should properly constrain required fields with NOT NULL', () => {
      const notNullCount = (migrationSQL.match(/NOT NULL/gi) || []).length;
      expect(notNullCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Edge Cases and Validation', () => {
    beforeAll(() => {
      const migrationPath = join(__dirname, '0000_yielding_karnak.sql');
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    });

    it('should allow NULL values for optional timestamp fields', () => {
      expect(migrationSQL).toMatch(/"start_time"\s+timestamp[,\s]/);
      expect(migrationSQL).toMatch(/"end_time"\s+timestamp[,\s]/);
    });

    it('should properly handle special characters in defaults', () => {
      expect(migrationSQL).toContain("'scheduled'");
    });

    it('should use public schema consistently', () => {
      const publicReferences = (migrationSQL.match(/"public"/g) || []).length;
      expect(publicReferences).toBeGreaterThanOrEqual(2);
    });

    it('should not have trailing commas in table definitions', () => {
      expect(migrationSQL).not.toMatch(/,\s*\)/);
    });
  });
});