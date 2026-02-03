import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Drizzle Metadata Files', () => {
  describe('_journal.json', () => {
    let journal;

    beforeAll(() => {
      const journalPath = join(__dirname, '_journal.json');
      const content = readFileSync(journalPath, 'utf-8');
      journal = JSON.parse(content);
    });

    it('should be valid JSON', () => {
      expect(journal).toBeDefined();
      expect(typeof journal).toBe('object');
    });

    it('should have version property', () => {
      expect(journal).toHaveProperty('version');
      expect(journal.version).toBe('7');
    });

    it('should specify postgresql dialect', () => {
      expect(journal).toHaveProperty('dialect');
      expect(journal.dialect).toBe('postgresql');
    });

    it('should have entries array', () => {
      expect(journal).toHaveProperty('entries');
      expect(Array.isArray(journal.entries)).toBe(true);
    });

    it('should have at least one migration entry', () => {
      expect(journal.entries.length).toBeGreaterThanOrEqual(1);
    });

    it('should have first entry with correct structure', () => {
      const firstEntry = journal.entries[0];
      expect(firstEntry).toHaveProperty('idx');
      expect(firstEntry).toHaveProperty('version');
      expect(firstEntry).toHaveProperty('when');
      expect(firstEntry).toHaveProperty('tag');
      expect(firstEntry).toHaveProperty('breakpoints');
    });

    it('should have first entry with idx 0', () => {
      expect(journal.entries[0].idx).toBe(0);
    });

    it('should have first entry with version 7', () => {
      expect(journal.entries[0].version).toBe('7');
    });

    it('should have first entry with valid timestamp', () => {
      const timestamp = journal.entries[0].when;
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeLessThan(Date.now() + 1000000000);
    });

    it('should have first entry with correct tag', () => {
      expect(journal.entries[0].tag).toBe('0000_yielding_karnak');
    });

    it('should have breakpoints enabled', () => {
      expect(journal.entries[0].breakpoints).toBe(true);
    });

    it('should have entries in chronological order', () => {
      for (let i = 1; i < journal.entries.length; i++) {
        expect(journal.entries[i].when).toBeGreaterThanOrEqual(journal.entries[i - 1].when);
      }
    });

    it('should have unique indices', () => {
      const indices = journal.entries.map(e => e.idx);
      const uniqueIndices = new Set(indices);
      expect(uniqueIndices.size).toBe(indices.length);
    });

    it('should have sequential indices', () => {
      const indices = journal.entries.map(e => e.idx).sort((a, b) => a - b);
      for (let i = 0; i < indices.length; i++) {
        expect(indices[i]).toBe(i);
      }
    });
  });

  describe('0000_snapshot.json', () => {
    let snapshot;

    beforeAll(() => {
      const snapshotPath = join(__dirname, '0000_snapshot.json');
      const content = readFileSync(snapshotPath, 'utf-8');
      snapshot = JSON.parse(content);
    });

    it('should be valid JSON', () => {
      expect(snapshot).toBeDefined();
      expect(typeof snapshot).toBe('object');
    });

    it('should have id property', () => {
      expect(snapshot).toHaveProperty('id');
      expect(typeof snapshot.id).toBe('string');
    });

    it('should have valid UUID for id', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(snapshot.id).toMatch(uuidRegex);
    });

    it('should have prevId property', () => {
      expect(snapshot).toHaveProperty('prevId');
      expect(snapshot.prevId).toBe('00000000-0000-0000-0000-000000000000');
    });

    it('should have version 7', () => {
      expect(snapshot.version).toBe('7');
    });

    it('should specify postgresql dialect', () => {
      expect(snapshot.dialect).toBe('postgresql');
    });

    describe('Tables', () => {
      it('should have tables object', () => {
        expect(snapshot).toHaveProperty('tables');
        expect(typeof snapshot.tables).toBe('object');
      });

      it('should define matches table', () => {
        expect(snapshot.tables).toHaveProperty('public.matches');
      });

      it('should define commentary table', () => {
        expect(snapshot.tables).toHaveProperty('public.commentary');
      });

      it('should have exactly 2 tables', () => {
        expect(Object.keys(snapshot.tables).length).toBe(2);
      });
    });

    describe('Matches Table Structure', () => {
      let matchesTable;

      beforeAll(() => {
        matchesTable = snapshot.tables['public.matches'];
      });

      it('should have correct table name', () => {
        expect(matchesTable.name).toBe('matches');
      });

      it('should have empty schema string', () => {
        expect(matchesTable.schema).toBe('');
      });

      it('should have columns object', () => {
        expect(matchesTable).toHaveProperty('columns');
        expect(typeof matchesTable.columns).toBe('object');
      });

      it('should have all required columns', () => {
        const expectedColumns = ['id', 'sport', 'home_team', 'away_team', 'status',
                                 'start_time', 'end_time', 'home_score', 'away_score', 'created_at'];
        expectedColumns.forEach(col => {
          expect(matchesTable.columns).toHaveProperty(col);
        });
      });

      it('should have id as serial primary key', () => {
        const id = matchesTable.columns.id;
        expect(id.type).toBe('serial');
        expect(id.primaryKey).toBe(true);
        expect(id.notNull).toBe(true);
      });

      it('should have sport as required text', () => {
        const sport = matchesTable.columns.sport;
        expect(sport.type).toBe('text');
        expect(sport.notNull).toBe(true);
      });

      it('should have home_team as required text', () => {
        const homeTeam = matchesTable.columns.home_team;
        expect(homeTeam.type).toBe('text');
        expect(homeTeam.notNull).toBe(true);
      });

      it('should have away_team as required text', () => {
        const awayTeam = matchesTable.columns.away_team;
        expect(awayTeam.type).toBe('text');
        expect(awayTeam.notNull).toBe(true);
      });

      it('should have status with match_status type', () => {
        const status = matchesTable.columns.status;
        expect(status.type).toBe('match_status');
        expect(status.typeSchema).toBe('public');
        expect(status.notNull).toBe(true);
        expect(status.default).toBe("'scheduled'");
      });

      it('should have timestamps for start and end time', () => {
        expect(matchesTable.columns.start_time.type).toBe('timestamp');
        expect(matchesTable.columns.end_time.type).toBe('timestamp');
      });

      it('should have scores with defaults', () => {
        expect(matchesTable.columns.home_score.type).toBe('integer');
        expect(matchesTable.columns.home_score.default).toBe(0);
        expect(matchesTable.columns.away_score.type).toBe('integer');
        expect(matchesTable.columns.away_score.default).toBe(0);
      });

      it('should have created_at with default now()', () => {
        const createdAt = matchesTable.columns.created_at;
        expect(createdAt.type).toBe('timestamp');
        expect(createdAt.notNull).toBe(true);
        expect(createdAt.default).toBe('now()');
      });

      it('should have empty indexes', () => {
        expect(matchesTable.indexes).toEqual({});
      });

      it('should have empty foreign keys', () => {
        expect(matchesTable.foreignKeys).toEqual({});
      });

      it('should have RLS disabled', () => {
        expect(matchesTable.isRLSEnabled).toBe(false);
      });
    });

    describe('Commentary Table Structure', () => {
      let commentaryTable;

      beforeAll(() => {
        commentaryTable = snapshot.tables['public.commentary'];
      });

      it('should have correct table name', () => {
        expect(commentaryTable.name).toBe('commentary');
      });

      it('should have all required columns', () => {
        const expectedColumns = ['id', 'match_id', 'minute', 'sequence', 'period',
                                 'event_type', 'actor', 'team', 'message', 'metadata',
                                 'tags', 'created_at'];
        expectedColumns.forEach(col => {
          expect(commentaryTable.columns).toHaveProperty(col);
        });
      });

      it('should have id as serial primary key', () => {
        const id = commentaryTable.columns.id;
        expect(id.type).toBe('serial');
        expect(id.primaryKey).toBe(true);
        expect(id.notNull).toBe(true);
      });

      it('should have match_id as required integer', () => {
        const matchId = commentaryTable.columns.match_id;
        expect(matchId.type).toBe('integer');
        expect(matchId.notNull).toBe(true);
      });

      it('should have optional integer fields', () => {
        expect(commentaryTable.columns.minute.type).toBe('integer');
        expect(commentaryTable.columns.minute.notNull).toBe(false);
        expect(commentaryTable.columns.sequence.type).toBe('integer');
        expect(commentaryTable.columns.sequence.notNull).toBe(false);
      });

      it('should have optional text fields', () => {
        const textFields = ['period', 'event_type', 'actor', 'team'];
        textFields.forEach(field => {
          expect(commentaryTable.columns[field].type).toBe('text');
          expect(commentaryTable.columns[field].notNull).toBe(false);
        });
      });

      it('should have message as required text', () => {
        const message = commentaryTable.columns.message;
        expect(message.type).toBe('text');
        expect(message.notNull).toBe(true);
      });

      it('should have metadata as jsonb', () => {
        const metadata = commentaryTable.columns.metadata;
        expect(metadata.type).toBe('jsonb');
        expect(metadata.notNull).toBe(false);
      });

      it('should have tags as text array', () => {
        const tags = commentaryTable.columns.tags;
        expect(tags.type).toBe('text[]');
        expect(tags.notNull).toBe(false);
      });

      it('should have foreign key to matches', () => {
        const fk = commentaryTable.foreignKeys.commentary_match_id_matches_id_fk;
        expect(fk).toBeDefined();
        expect(fk.tableFrom).toBe('commentary');
        expect(fk.tableTo).toBe('matches');
        expect(fk.columnsFrom).toEqual(['match_id']);
        expect(fk.columnsTo).toEqual(['id']);
        expect(fk.onDelete).toBe('no action');
        expect(fk.onUpdate).toBe('no action');
      });
    });

    describe('Enums', () => {
      it('should have enums object', () => {
        expect(snapshot).toHaveProperty('enums');
        expect(typeof snapshot.enums).toBe('object');
      });

      it('should define match_status enum', () => {
        expect(snapshot.enums).toHaveProperty('public.match_status');
      });

      it('should have correct enum values', () => {
        const matchStatus = snapshot.enums['public.match_status'];
        expect(matchStatus.name).toBe('match_status');
        expect(matchStatus.schema).toBe('public');
        expect(matchStatus.values).toEqual(['scheduled', 'live', 'finished']);
      });

      it('should have enum values in correct order', () => {
        const values = snapshot.enums['public.match_status'].values;
        expect(values[0]).toBe('scheduled');
        expect(values[1]).toBe('live');
        expect(values[2]).toBe('finished');
      });
    });

    describe('Metadata Structure', () => {
      it('should have empty schemas object', () => {
        expect(snapshot.schemas).toEqual({});
      });

      it('should have empty sequences object', () => {
        expect(snapshot.sequences).toEqual({});
      });

      it('should have empty roles object', () => {
        expect(snapshot.roles).toEqual({});
      });

      it('should have empty policies object', () => {
        expect(snapshot.policies).toEqual({});
      });

      it('should have empty views object', () => {
        expect(snapshot.views).toEqual({});
      });

      it('should have _meta object', () => {
        expect(snapshot).toHaveProperty('_meta');
        expect(snapshot._meta.columns).toEqual({});
        expect(snapshot._meta.schemas).toEqual({});
        expect(snapshot._meta.tables).toEqual({});
      });
    });

    describe('Data Integrity', () => {
      it('should have consistent primary key configurations', () => {
        Object.values(snapshot.tables).forEach(table => {
          const pkColumns = Object.values(table.columns).filter(col => col.primaryKey);
          expect(pkColumns.length).toBeGreaterThan(0);
        });
      });

      it('should have all foreign key targets exist', () => {
        Object.values(snapshot.tables).forEach(table => {
          Object.values(table.foreignKeys).forEach(fk => {
            const targetTable = Object.keys(snapshot.tables).find(t =>
              snapshot.tables[t].name === fk.tableTo
            );
            expect(targetTable).toBeDefined();
          });
        });
      });

      it('should have all notNull fields explicitly defined', () => {
        Object.values(snapshot.tables).forEach(table => {
          Object.values(table.columns).forEach(col => {
            expect(col).toHaveProperty('notNull');
            expect(typeof col.notNull).toBe('boolean');
          });
        });
      });

      it('should have all primaryKey flags explicitly defined', () => {
        Object.values(snapshot.tables).forEach(table => {
          Object.values(table.columns).forEach(col => {
            expect(col).toHaveProperty('primaryKey');
            expect(typeof col.primaryKey).toBe('boolean');
          });
        });
      });
    });

    describe('Schema Validation', () => {
      it('should use consistent naming convention for foreign keys', () => {
        const commentaryTable = snapshot.tables['public.commentary'];
        const fkName = Object.keys(commentaryTable.foreignKeys)[0];
        expect(fkName).toMatch(/^[a-z_]+_fk$/);
      });

      it('should have proper type definitions', () => {
        const validTypes = ['serial', 'integer', 'text', 'timestamp', 'jsonb', 'text[]', 'match_status'];
        Object.values(snapshot.tables).forEach(table => {
          Object.values(table.columns).forEach(col => {
            expect(validTypes).toContain(col.type);
          });
        });
      });

      it('should have defaults only on appropriate columns', () => {
        Object.values(snapshot.tables).forEach(table => {
          Object.values(table.columns).forEach(col => {
            if (col.default !== undefined) {
              expect(['integer', 'timestamp', 'match_status']).toContain(col.type);
            }
          });
        });
      });
    });
  });

  describe('Metadata Consistency', () => {
    let journal;
    let snapshot;

    beforeAll(() => {
      const journalPath = join(__dirname, '_journal.json');
      const snapshotPath = join(__dirname, '0000_snapshot.json');
      journal = JSON.parse(readFileSync(journalPath, 'utf-8'));
      snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));
    });

    it('should have matching version numbers', () => {
      expect(journal.version).toBe(snapshot.version);
    });

    it('should have matching dialect', () => {
      expect(journal.dialect).toBe(snapshot.dialect);
    });

    it('should reference correct snapshot in journal', () => {
      const firstEntry = journal.entries[0];
      expect(firstEntry.tag).toBe('0000_yielding_karnak');
    });

    it('should have snapshot id different from prevId', () => {
      expect(snapshot.id).not.toBe(snapshot.prevId);
    });

    it('should have valid prevId for initial migration', () => {
      expect(snapshot.prevId).toBe('00000000-0000-0000-0000-000000000000');
    });
  });
});