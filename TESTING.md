# Testing Guide

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Files

- `src/validation/matches.test.js` - Validation schema tests (68 tests)
- `src/utils/match-status.test.js` - Match status utility tests (30 tests)

## What's Tested

### ✅ Validation Layer
All Zod schemas for match-related operations:
- Query parameter validation (limit)
- Path parameter validation (id)
- Request body validation (create match, update score)
- Chronological validation (endTime after startTime)

### ✅ Business Logic
Match status calculation and synchronization:
- Status determination (SCHEDULED, LIVE, FINISHED)
- Time-based transitions
- Error handling for invalid inputs

### ⚠️ Routes Layer
Integration tests for routes require a test database. See `src/routes/README.test.md` for:
- Manual testing instructions
- Integration test recommendations
- Database setup guidance

## Test Results

```
Test Files  2 passed (2)
Tests       98 passed (98)
Duration    ~300ms
```

## Writing New Tests

Tests use Vitest. Example structure:

```javascript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  describe('specific aspect', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test

# Optionally check for minimum coverage
- name: Check coverage
  run: npm run test:coverage
```

## Troubleshooting

**Tests fail with "DATABASE_URL is not defined"**
- This is expected for route integration tests
- Unit tests (validation, utils) do not require database
- Vitest config provides a mock DATABASE_URL for env

**Tests run slowly**
- Use `npm run test:watch` for incremental testing
- Tests should complete in <1 second normally

**Import errors**
- Ensure you're using Node.js with ES modules support
- Check that `"type": "module"` is in package.json