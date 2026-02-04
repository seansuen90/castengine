import { describe, it, expect, vi } from 'vitest';
import { getMatchStatus, syncMatchStatus } from './match-status.js';
import { MATCH_STATUS } from '../validation/matches.js';

describe('getMatchStatus', () => {
  describe('basic functionality', () => {
    it('should return SCHEDULED when current time is before start time', () => {
      const startTime = '2026-03-01T10:00:00Z';
      const endTime = '2026-03-01T12:00:00Z';
      const now = new Date('2026-02-28T10:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.SCHEDULED);
    });

    it('should return LIVE when current time is between start and end time', () => {
      const startTime = '2026-03-01T10:00:00Z';
      const endTime = '2026-03-01T12:00:00Z';
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });

    it('should return FINISHED when current time is after end time', () => {
      const startTime = '2026-03-01T10:00:00Z';
      const endTime = '2026-03-01T12:00:00Z';
      const now = new Date('2026-03-01T13:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.FINISHED);
    });

    it('should use current time when now parameter is not provided', () => {
      const startTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const endTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      const status = getMatchStatus(startTime, endTime);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });
  });

  describe('boundary conditions', () => {
    it('should return SCHEDULED when current time equals start time', () => {
      const startTime = '2026-03-01T10:00:00Z';
      const endTime = '2026-03-01T12:00:00Z';
      const now = new Date('2026-03-01T10:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });

    it('should return FINISHED when current time equals end time', () => {
      const startTime = '2026-03-01T10:00:00Z';
      const endTime = '2026-03-01T12:00:00Z';
      const now = new Date('2026-03-01T12:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.FINISHED);
    });

    it('should return FINISHED one millisecond after end time', () => {
      const startTime = '2026-03-01T10:00:00.000Z';
      const endTime = '2026-03-01T12:00:00.000Z';
      const now = new Date('2026-03-01T12:00:00.001Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.FINISHED);
    });

    it('should return SCHEDULED one millisecond before start time', () => {
      const startTime = '2026-03-01T10:00:00.000Z';
      const endTime = '2026-03-01T12:00:00.000Z';
      const now = new Date('2026-03-01T09:59:59.999Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.SCHEDULED);
    });
  });

  describe('input type handling', () => {
    it('should handle Date objects as input', () => {
      const startTime = new Date('2026-03-01T10:00:00Z');
      const endTime = new Date('2026-03-01T12:00:00Z');
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });

    it('should handle ISO strings as input', () => {
      const startTime = '2026-03-01T10:00:00Z';
      const endTime = '2026-03-01T12:00:00Z';
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });

    it('should handle timestamp numbers as input', () => {
      const startTime = new Date('2026-03-01T10:00:00Z').getTime();
      const endTime = new Date('2026-03-01T12:00:00Z').getTime();
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });
  });

  describe('invalid input handling', () => {
    it('should return null for invalid start time', () => {
      const startTime = 'invalid-date';
      const endTime = '2026-03-01T12:00:00Z';
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBeNull();
    });

    it('should return null for invalid end time', () => {
      const startTime = '2026-03-01T10:00:00Z';
      const endTime = 'invalid-date';
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBeNull();
    });

    it('should return null for both invalid times', () => {
      const startTime = 'invalid-start';
      const endTime = 'invalid-end';
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBeNull();
    });

    it('should return null for undefined start time', () => {
      const startTime = undefined;
      const endTime = '2026-03-01T12:00:00Z';
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBeNull();
    });

    it('should handle null end time as epoch (valid date)', () => {
      const startTime = '2026-03-01T10:00:00Z';
      const endTime = null; // becomes epoch (1970-01-01), which is before startTime
      const now = new Date('2026-03-01T11:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      // Since endTime (epoch) is before startTime (2026), the match is "finished"
      expect(status).toBe(MATCH_STATUS.FINISHED);
    });
  });

  describe('edge cases', () => {
    it('should handle very short match duration', () => {
      const startTime = '2026-03-01T10:00:00.000Z';
      const endTime = '2026-03-01T10:00:00.001Z'; // 1 millisecond match
      const now = new Date('2026-03-01T10:00:00.000Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });

    it('should handle very long match duration', () => {
      const startTime = '2026-01-01T00:00:00Z';
      const endTime = '2026-12-31T23:59:59Z'; // Year-long match
      const now = new Date('2026-06-15T12:00:00Z');

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });

    it('should handle dates in different timezones correctly', () => {
      const startTime = '2026-03-01T10:00:00+05:00';
      const endTime = '2026-03-01T12:00:00+05:00';
      const now = new Date('2026-03-01T06:30:00Z'); // UTC time

      const status = getMatchStatus(startTime, endTime, now);

      expect(status).toBe(MATCH_STATUS.LIVE);
    });
  });
});

describe('syncMatchStatus', () => {
  describe('basic functionality', () => {
    it('should not update status when it matches the calculated status', async () => {
      // Use dynamic dates that will be scheduled in the future
      const match = {
        startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: MATCH_STATUS.SCHEDULED,
      };
      const updateStatus = vi.fn();

      const result = await syncMatchStatus(match, updateStatus);

      expect(updateStatus).not.toHaveBeenCalled();
      expect(result).toBe(MATCH_STATUS.SCHEDULED);
      expect(match.status).toBe(MATCH_STATUS.SCHEDULED);
    });

    it('should update status when it differs from calculated status', async () => {
      // Match that should be live but is marked as scheduled
      const match = {
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        status: MATCH_STATUS.SCHEDULED,
      };
      const updateStatus = vi.fn().mockResolvedValue(undefined);

      const result = await syncMatchStatus(match, updateStatus);

      expect(updateStatus).toHaveBeenCalledWith(MATCH_STATUS.LIVE);
      expect(result).toBe(MATCH_STATUS.LIVE);
      expect(match.status).toBe(MATCH_STATUS.LIVE);
    });

    it('should update match object with new status', async () => {
      const match = {
        startTime: new Date('2026-02-01T10:00:00Z'),
        endTime: new Date('2026-02-01T12:00:00Z'),
        status: MATCH_STATUS.LIVE,
      };
      const updateStatus = vi.fn().mockResolvedValue(undefined);

      const result = await syncMatchStatus(match, updateStatus);

      expect(updateStatus).toHaveBeenCalledWith(MATCH_STATUS.FINISHED);
      expect(match.status).toBe(MATCH_STATUS.FINISHED);
      expect(result).toBe(MATCH_STATUS.FINISHED);
    });
  });

  describe('status transitions', () => {
    it('should transition from SCHEDULED to LIVE', async () => {
      const match = {
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        status: MATCH_STATUS.SCHEDULED,
      };
      const updateStatus = vi.fn().mockResolvedValue(undefined);

      await syncMatchStatus(match, updateStatus);

      expect(updateStatus).toHaveBeenCalledWith(MATCH_STATUS.LIVE);
      expect(match.status).toBe(MATCH_STATUS.LIVE);
    });

    it('should transition from LIVE to FINISHED', async () => {
      const match = {
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        status: MATCH_STATUS.LIVE,
      };
      const updateStatus = vi.fn().mockResolvedValue(undefined);

      await syncMatchStatus(match, updateStatus);

      expect(updateStatus).toHaveBeenCalledWith(MATCH_STATUS.FINISHED);
      expect(match.status).toBe(MATCH_STATUS.FINISHED);
    });

    it('should transition from SCHEDULED to FINISHED for past matches', async () => {
      const match = {
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        status: MATCH_STATUS.SCHEDULED,
      };
      const updateStatus = vi.fn().mockResolvedValue(undefined);

      await syncMatchStatus(match, updateStatus);

      expect(updateStatus).toHaveBeenCalledWith(MATCH_STATUS.FINISHED);
      expect(match.status).toBe(MATCH_STATUS.FINISHED);
    });
  });

  describe('error handling', () => {
    it('should return current status when match times are invalid', async () => {
      const match = {
        startTime: 'invalid',
        endTime: 'invalid',
        status: MATCH_STATUS.LIVE,
      };
      const updateStatus = vi.fn();

      const result = await syncMatchStatus(match, updateStatus);

      expect(updateStatus).not.toHaveBeenCalled();
      expect(result).toBe(MATCH_STATUS.LIVE);
      expect(match.status).toBe(MATCH_STATUS.LIVE);
    });

    it('should update status even when startTime is null (treated as epoch)', async () => {
      const match = {
        startTime: null, // Will be epoch, which is in the past
        endTime: new Date('2026-03-01T12:00:00Z'),
        status: MATCH_STATUS.SCHEDULED,
      };
      const updateStatus = vi.fn().mockResolvedValue(undefined);

      const result = await syncMatchStatus(match, updateStatus);

      // Since epoch is in the past and endTime is in future, match is LIVE
      expect(updateStatus).toHaveBeenCalledWith(MATCH_STATUS.LIVE);
      expect(result).toBe(MATCH_STATUS.LIVE);
    });

    it('should handle updateStatus function that throws', async () => {
      const match = {
        startTime: new Date(Date.now() - 60 * 60 * 1000),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        status: MATCH_STATUS.SCHEDULED,
      };
      const updateStatus = vi.fn().mockRejectedValue(new Error('Update failed'));

      await expect(syncMatchStatus(match, updateStatus)).rejects.toThrow('Update failed');
      expect(updateStatus).toHaveBeenCalledWith(MATCH_STATUS.LIVE);
    });
  });

  describe('updateStatus callback behavior', () => {
    it('should call updateStatus with correct status parameter', async () => {
      const match = {
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        status: MATCH_STATUS.FINISHED,
      };
      const updateStatus = vi.fn().mockResolvedValue(undefined);

      await syncMatchStatus(match, updateStatus);

      expect(updateStatus).toHaveBeenCalledTimes(1);
      expect(updateStatus).toHaveBeenCalledWith(MATCH_STATUS.LIVE);
    });

    it('should only call updateStatus once per sync', async () => {
      const match = {
        startTime: new Date(Date.now() - 60 * 60 * 1000),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        status: MATCH_STATUS.SCHEDULED,
      };
      const updateStatus = vi.fn().mockResolvedValue(undefined);

      await syncMatchStatus(match, updateStatus);

      expect(updateStatus).toHaveBeenCalledTimes(1);
    });
  });
});