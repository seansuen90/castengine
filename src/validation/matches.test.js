import { describe, it, expect } from 'vitest';
import {
  MATCH_STATUS,
  listMatchesQuerySchema,
  matchIdParamSchema,
  createMatchSchema,
  updateScoreSchema,
} from './matches.js';

describe('MATCH_STATUS', () => {
  it('should define SCHEDULED status', () => {
    expect(MATCH_STATUS.SCHEDULED).toBe('scheduled');
  });

  it('should define LIVE status', () => {
    expect(MATCH_STATUS.LIVE).toBe('live');
  });

  it('should define FINISHED status', () => {
    expect(MATCH_STATUS.FINISHED).toBe('finished');
  });

  it('should have exactly 3 status values', () => {
    expect(Object.keys(MATCH_STATUS)).toHaveLength(3);
  });
});

describe('listMatchesQuerySchema', () => {
  describe('valid inputs', () => {
    it('should accept valid positive integer limit', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(10);
    });

    it('should accept limit at maximum value of 100', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 100 });

      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(100);
    });

    it('should accept limit of 1', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 1 });

      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(1);
    });

    it('should accept empty object (limit is optional)', () => {
      const result = listMatchesQuerySchema.safeParse({});

      expect(result.success).toBe(true);
      expect(result.data?.limit).toBeUndefined();
    });

    it('should coerce string numbers to integers', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: '50' });

      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(50);
    });
  });

  describe('invalid inputs', () => {
    it('should reject limit greater than 100', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 101 });

      expect(result.success).toBe(false);
    });

    it('should reject zero limit', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 0 });

      expect(result.success).toBe(false);
    });

    it('should reject negative limit', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: -1 });

      expect(result.success).toBe(false);
    });

    it('should reject decimal limit', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 10.5 });

      expect(result.success).toBe(false);
    });

    it('should reject non-numeric string limit', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 'abc' });

      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers gracefully', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 999999 });

      expect(result.success).toBe(false);
    });

    it('should ignore extra fields', () => {
      const result = listMatchesQuerySchema.safeParse({ limit: 10, extra: 'field' });

      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(10);
    });
  });
});

describe('matchIdParamSchema', () => {
  describe('valid inputs', () => {
    it('should accept positive integer id', () => {
      const result = matchIdParamSchema.safeParse({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(1);
    });

    it('should accept large positive integer', () => {
      const result = matchIdParamSchema.safeParse({ id: 999999 });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(999999);
    });

    it('should coerce string numbers to integers', () => {
      const result = matchIdParamSchema.safeParse({ id: '123' });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(123);
    });
  });

  describe('invalid inputs', () => {
    it('should reject zero id', () => {
      const result = matchIdParamSchema.safeParse({ id: 0 });

      expect(result.success).toBe(false);
    });

    it('should reject negative id', () => {
      const result = matchIdParamSchema.safeParse({ id: -1 });

      expect(result.success).toBe(false);
    });

    it('should reject decimal id', () => {
      const result = matchIdParamSchema.safeParse({ id: 1.5 });

      expect(result.success).toBe(false);
    });

    it('should reject non-numeric string id', () => {
      const result = matchIdParamSchema.safeParse({ id: 'abc' });

      expect(result.success).toBe(false);
    });

    it('should reject missing id', () => {
      const result = matchIdParamSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});

describe('createMatchSchema', () => {
  const validMatch = {
    sport: 'football',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    startTime: '2026-03-01T10:00:00Z',
    endTime: '2026-03-01T12:00:00Z',
  };

  describe('valid inputs', () => {
    it('should accept valid match data without scores', () => {
      const result = createMatchSchema.safeParse(validMatch);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(validMatch);
    });

    it('should accept valid match data with scores', () => {
      const matchWithScores = {
        ...validMatch,
        homeScore: 2,
        awayScore: 1,
      };
      const result = createMatchSchema.safeParse(matchWithScores);

      expect(result.success).toBe(true);
      expect(result.data?.homeScore).toBe(2);
      expect(result.data?.awayScore).toBe(1);
    });

    it('should accept zero scores', () => {
      const matchWithZeroScores = {
        ...validMatch,
        homeScore: 0,
        awayScore: 0,
      };
      const result = createMatchSchema.safeParse(matchWithZeroScores);

      expect(result.success).toBe(true);
      expect(result.data?.homeScore).toBe(0);
      expect(result.data?.awayScore).toBe(0);
    });

    it('should coerce string scores to numbers', () => {
      const matchWithStringScores = {
        ...validMatch,
        homeScore: '3',
        awayScore: '2',
      };
      const result = createMatchSchema.safeParse(matchWithStringScores);

      expect(result.success).toBe(true);
      expect(result.data?.homeScore).toBe(3);
      expect(result.data?.awayScore).toBe(2);
    });

    it('should accept match with endTime far in the future', () => {
      const longMatch = {
        ...validMatch,
        startTime: '2026-03-01T10:00:00Z',
        endTime: '2027-03-01T10:00:00Z',
      };
      const result = createMatchSchema.safeParse(longMatch);

      expect(result.success).toBe(true);
    });

    it('should accept different ISO datetime formats', () => {
      const matchWithDifferentFormat = {
        ...validMatch,
        startTime: '2026-03-01T10:00:00.000Z',
        endTime: '2026-03-01T12:00:00.000Z',
      };
      const result = createMatchSchema.safeParse(matchWithDifferentFormat);

      expect(result.success).toBe(true);
    });

    it('should reject match with timezone offset (only Z suffix allowed)', () => {
      const matchWithTimezone = {
        ...validMatch,
        startTime: '2026-03-01T10:00:00+05:00',
        endTime: '2026-03-01T12:00:00+05:00',
      };
      const result = createMatchSchema.safeParse(matchWithTimezone);

      expect(result.success).toBe(false);
    });
  });

  describe('invalid sport field', () => {
    it('should reject empty sport string', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        sport: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing sport', () => {
      const { sport, ...matchWithoutSport } = validMatch;
      const result = createMatchSchema.safeParse(matchWithoutSport);

      expect(result.success).toBe(false);
    });

    it('should reject numeric sport', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        sport: 123,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('invalid team fields', () => {
    it('should reject empty homeTeam string', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        homeTeam: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty awayTeam string', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        awayTeam: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing homeTeam', () => {
      const { homeTeam, ...matchWithoutHome } = validMatch;
      const result = createMatchSchema.safeParse(matchWithoutHome);

      expect(result.success).toBe(false);
    });

    it('should reject missing awayTeam', () => {
      const { awayTeam, ...matchWithoutAway } = validMatch;
      const result = createMatchSchema.safeParse(matchWithoutAway);

      expect(result.success).toBe(false);
    });
  });

  describe('invalid time fields', () => {
    it('should reject non-ISO datetime startTime', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        startTime: '2026-03-01 10:00:00',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid startTime', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        startTime: 'invalid-date',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid endTime', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        endTime: 'invalid-date',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing startTime', () => {
      const { startTime, ...matchWithoutStart } = validMatch;
      const result = createMatchSchema.safeParse(matchWithoutStart);

      expect(result.success).toBe(false);
    });

    it('should reject missing endTime', () => {
      const { endTime, ...matchWithoutEnd } = validMatch;
      const result = createMatchSchema.safeParse(matchWithoutEnd);

      expect(result.success).toBe(false);
    });
  });

  describe('time chronology validation', () => {
    it('should reject endTime before startTime', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        startTime: '2026-03-01T12:00:00Z',
        endTime: '2026-03-01T10:00:00Z',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const endTimeIssue = result.error.issues.find(issue => issue.path.includes('endTime'));
        expect(endTimeIssue?.message).toContain('chronologically after startTime');
      }
    });

    it('should reject endTime equal to startTime', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        startTime: '2026-03-01T10:00:00Z',
        endTime: '2026-03-01T10:00:00Z',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const endTimeIssue = result.error.issues.find(issue => issue.path.includes('endTime'));
        expect(endTimeIssue?.message).toContain('chronologically after startTime');
      }
    });

    it('should accept endTime one millisecond after startTime', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        startTime: '2026-03-01T10:00:00.000Z',
        endTime: '2026-03-01T10:00:00.001Z',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid score fields', () => {
    it('should reject negative homeScore', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        homeScore: -1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative awayScore', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        awayScore: -1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject decimal homeScore', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        homeScore: 1.5,
      });

      expect(result.success).toBe(false);
    });

    it('should reject decimal awayScore', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        awayScore: 2.5,
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-numeric homeScore string', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        homeScore: 'abc',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should accept very high scores', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        homeScore: 999,
        awayScore: 999,
      });

      expect(result.success).toBe(true);
    });

    it('should accept single character sport name', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        sport: 'A',
      });

      expect(result.success).toBe(true);
    });

    it('should accept single character team names', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        homeTeam: 'A',
        awayTeam: 'B',
      });

      expect(result.success).toBe(true);
    });

    it('should accept very long sport name', () => {
      const result = createMatchSchema.safeParse({
        ...validMatch,
        sport: 'A'.repeat(1000),
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('updateScoreSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid scores', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 2,
        awayScore: 1,
      });

      expect(result.success).toBe(true);
      expect(result.data?.homeScore).toBe(2);
      expect(result.data?.awayScore).toBe(1);
    });

    it('should accept zero scores', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 0,
        awayScore: 0,
      });

      expect(result.success).toBe(true);
      expect(result.data?.homeScore).toBe(0);
      expect(result.data?.awayScore).toBe(0);
    });

    it('should coerce string scores to numbers', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: '3',
        awayScore: '2',
      });

      expect(result.success).toBe(true);
      expect(result.data?.homeScore).toBe(3);
      expect(result.data?.awayScore).toBe(2);
    });

    it('should accept very high scores', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 999,
        awayScore: 888,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject negative homeScore', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: -1,
        awayScore: 1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative awayScore', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 1,
        awayScore: -1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject decimal homeScore', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 1.5,
        awayScore: 1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject decimal awayScore', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 1,
        awayScore: 1.5,
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing homeScore', () => {
      const result = updateScoreSchema.safeParse({
        awayScore: 1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing awayScore', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-numeric string homeScore', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 'abc',
        awayScore: 1,
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-numeric string awayScore', () => {
      const result = updateScoreSchema.safeParse({
        homeScore: 1,
        awayScore: 'xyz',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty object', () => {
      const result = updateScoreSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});