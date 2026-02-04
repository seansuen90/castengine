# Routes Testing

## Integration Tests Not Included

The comprehensive integration tests for the matches routes (`src/routes/matches.js`) require a live database connection and are best suited for integration testing with a test database.

### Recommended Approach for Route Testing

For full integration testing of the routes, you should:

1. **Set up a test database**: Create a separate PostgreSQL database for testing
2. **Use database transactions**: Wrap each test in a transaction that rolls back after completion
3. **Seed test data**: Create fixtures for consistent test data
4. **Test with real database**: This ensures the drizzle ORM queries work correctly

### What IS Tested

The following components are thoroughly tested with unit tests:

- ✅ **Validation schemas** (`src/validation/matches.test.js`): All Zod schemas including edge cases
- ✅ **Match status utility** (`src/utils/match-status.test.js`): Status calculation and syncing logic
  - Boundary conditions (start/end times)
  - Invalid input handling
  - Status transitions

### Manual Testing Routes

To manually test the routes:

```bash
# Start the server
npm run dev

# Create a match
curl -X POST http://localhost:8000/matches \
  -H "Content-Type: application/json" \
  -d '{
    "sport": "football",
    "homeTeam": "Team A",
    "awayTeam": "Team B",
    "startTime": "2026-03-01T10:00:00Z",
    "endTime": "2026-03-01T12:00:00Z"
  }'

# List matches
curl http://localhost:8000/matches?limit=10
```

### Future Improvements

Consider adding:
- Integration test suite with test database setup/teardown
- API contract testing with tools like Pact
- E2E tests with a testing framework like Playwright