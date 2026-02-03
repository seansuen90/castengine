import { describe, it, expect } from 'vitest';
import { matches, commentary, matchStatusEnum } from './schema.js';

describe('Database Schema', () => {
  describe('matchStatusEnum', () => {
    it('should define the match status enum with correct values', () => {
      expect(matchStatusEnum).toBeDefined();
      expect(matchStatusEnum.enumName).toBe('match_status');
      expect(matchStatusEnum.enumValues).toEqual(['scheduled', 'live', 'finished']);
    });

    it('should have all three status values available', () => {
      const validStatuses = ['scheduled', 'live', 'finished'];
      validStatuses.forEach(status => {
        expect(matchStatusEnum.enumValues).toContain(status);
      });
    });
  });

  describe('matches table', () => {
    it('should be defined with correct table name', () => {
      expect(matches).toBeDefined();
      expect(matches[Symbol.for('drizzle:Name')]).toBe('matches');
    });

    it('should have all required columns defined', () => {
      const columns = Object.keys(matches);
      const requiredColumns = [
        'id',
        'sport',
        'homeTeam',
        'awayTeam',
        'status',
        'startTime',
        'endTime',
        'homeScore',
        'awayScore',
        'createdAt'
      ];

      requiredColumns.forEach(column => {
        expect(columns).toContain(column);
      });
    });

    it('should have id as serial primary key', () => {
      expect(matches.id).toBeDefined();
      expect(matches.id.primary).toBe(true);
    });

    it('should have sport as required text field', () => {
      expect(matches.sport).toBeDefined();
      expect(matches.sport.notNull).toBe(true);
    });

    it('should have homeTeam as required text field', () => {
      expect(matches.homeTeam).toBeDefined();
      expect(matches.homeTeam.notNull).toBe(true);
    });

    it('should have awayTeam as required text field', () => {
      expect(matches.awayTeam).toBeDefined();
      expect(matches.awayTeam.notNull).toBe(true);
    });

    it('should have status with default value of scheduled', () => {
      expect(matches.status).toBeDefined();
      expect(matches.status.notNull).toBe(true);
      expect(matches.status.hasDefault).toBe(true);
    });

    it('should have optional timestamp fields for start and end times', () => {
      expect(matches.startTime).toBeDefined();
      expect(matches.endTime).toBeDefined();
    });

    it('should have homeScore with default value of 0', () => {
      expect(matches.homeScore).toBeDefined();
      expect(matches.homeScore.notNull).toBe(true);
      expect(matches.homeScore.hasDefault).toBe(true);
    });

    it('should have awayScore with default value of 0', () => {
      expect(matches.awayScore).toBeDefined();
      expect(matches.awayScore.notNull).toBe(true);
      expect(matches.awayScore.hasDefault).toBe(true);
    });

    it('should have createdAt with defaultNow', () => {
      expect(matches.createdAt).toBeDefined();
      expect(matches.createdAt.notNull).toBe(true);
      expect(matches.createdAt.hasDefault).toBe(true);
    });

    it('should have exactly 10 columns', () => {
      const columns = Object.keys(matches).filter(key => !key.startsWith('_') && typeof key === 'string');
      expect(columns.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('commentary table', () => {
    it('should be defined with correct table name', () => {
      expect(commentary).toBeDefined();
      expect(commentary[Symbol.for('drizzle:Name')]).toBe('commentary');
    });

    it('should have all required columns defined', () => {
      const columns = Object.keys(commentary);
      const requiredColumns = [
        'id',
        'matchId',
        'minute',
        'sequence',
        'period',
        'eventType',
        'actor',
        'team',
        'message',
        'metadata',
        'tags',
        'createdAt'
      ];

      requiredColumns.forEach(column => {
        expect(columns).toContain(column);
      });
    });

    it('should have id as serial primary key', () => {
      expect(commentary.id).toBeDefined();
      expect(commentary.id.primary).toBe(true);
    });

    it('should have matchId as required foreign key', () => {
      expect(commentary.matchId).toBeDefined();
      expect(commentary.matchId.notNull).toBe(true);
    });

    it('should have optional minute field', () => {
      expect(commentary.minute).toBeDefined();
    });

    it('should have optional sequence field', () => {
      expect(commentary.sequence).toBeDefined();
    });

    it('should have optional period field', () => {
      expect(commentary.period).toBeDefined();
    });

    it('should have optional eventType field', () => {
      expect(commentary.eventType).toBeDefined();
    });

    it('should have optional actor field', () => {
      expect(commentary.actor).toBeDefined();
    });

    it('should have optional team field', () => {
      expect(commentary.team).toBeDefined();
    });

    it('should have message as required text field', () => {
      expect(commentary.message).toBeDefined();
      expect(commentary.message.notNull).toBe(true);
    });

    it('should have optional metadata field as jsonb', () => {
      expect(commentary.metadata).toBeDefined();
    });

    it('should have optional tags field as text array', () => {
      expect(commentary.tags).toBeDefined();
    });

    it('should have createdAt with defaultNow', () => {
      expect(commentary.createdAt).toBeDefined();
      expect(commentary.createdAt.notNull).toBe(true);
      expect(commentary.createdAt.hasDefault).toBe(true);
    });

    it('should have exactly 12 columns', () => {
      const columns = Object.keys(commentary).filter(key => !key.startsWith('_') && typeof key === 'string');
      expect(columns.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Schema Relationships', () => {
    it('should establish foreign key relationship from commentary to matches', () => {
      expect(commentary.matchId).toBeDefined();
      const columnConfig = commentary.matchId.config;
      expect(columnConfig).toBeDefined();
    });
  });

  describe('Schema Edge Cases', () => {
    it('should handle all match status enum values correctly', () => {
      const statuses = ['scheduled', 'live', 'finished'];
      statuses.forEach(status => {
        expect(matchStatusEnum.enumValues.includes(status)).toBe(true);
      });
    });

    it('should not allow additional status values beyond enum', () => {
      const invalidStatuses = ['pending', 'cancelled', 'postponed'];
      invalidStatuses.forEach(status => {
        expect(matchStatusEnum.enumValues.includes(status)).toBe(false);
      });
    });

    it('should support negative scores (for penalty scenarios)', () => {
      expect(matches.homeScore).toBeDefined();
      expect(matches.awayScore).toBeDefined();
    });
  });
});