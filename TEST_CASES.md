# Test Cases Documentation

## Test Suite Overview

File: `test-secure-mode.sh`

Comprehensive test suite for Secure Mode features including:
- Page Mode (TRADITIONAL/SECURE)
- Mode Conversion
- Storage Info
- Walrus Pricing
- Password Reminder

## Running Tests

```bash
# Make sure backend is running
pnpm run start:dev

# In another terminal, run tests
./test-secure-mode.sh
```

## Test Cases

### Test 1: User Creation ✅
- Creates a test user via Supabase
- Syncs user to database
- Verifies authentication token

### Test 2: Traditional Page Creation ✅
- Creates a page with `mode: "TRADITIONAL"`
- Verifies page mode is set correctly
- Checks page ID is returned

### Test 3: Secure Page Creation ✅
- Creates a page with `mode: "SECURE"`
- Verifies page mode is set correctly
- Checks page ID is returned

### Test 4: Add Blocks to Traditional Page ✅
- Creates a TEXT block on traditional page
- Verifies block is created successfully
- Checks block ID is returned

### Test 5: Convert Traditional → Secure ✅
- Converts a traditional page to secure mode
- Verifies mode change
- Checks storage cost is calculated
- Verifies CID (Content Identifier) is generated
- Validates storage info in response

### Test 6: Storage Info Endpoint ✅
- Retrieves storage information for secure page
- Verifies days remaining is returned
- Checks expiry date is present

### Test 7: Convert Secure → Traditional ✅
- Converts a secure page back to traditional mode
- Verifies mode change
- Checks storage fields are cleared

### Test 8: Walrus Pricing ✅
- Tests pricing calculation endpoint
- Verifies Quilt price is returned
- Tests pricing options endpoint
- Checks multiple duration options are available

### Test 9: Password Reminder ✅
- Retrieves password reminder status
- Verifies days since change is returned
- Tests password change recording
- Validates reminder level and message

### Test 10: Profile with Password Reminder ✅
- Retrieves user profile
- Verifies password reminder is included
- Checks reminder status is present

## Expected Results

All tests should pass with:
- ✅ Green checkmarks for each test
- 📊 Summary showing 0 failed tests
- 🎉 Success message at the end

## Troubleshooting

### Backend not running
```bash
pnpm run start:dev
```

### Authentication errors
- Check `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Verify Supabase project is active

### Database errors
- Ensure migration SQL has been run
- Check database connection in `.env`

### TypeScript errors
- Run: `pnpm prisma generate`
- Restart TypeScript server in IDE

## Manual Testing

### Via Swagger UI
1. Open `http://localhost:3000/docs`
2. Authorize with Supabase token
3. Test endpoints manually

### Via curl
```bash
# Set token
export TOKEN="your-supabase-token"

# Create traditional page
curl -X POST http://localhost:3000/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "mode": "TRADITIONAL"}'

# Convert to secure
curl -X POST http://localhost:3000/pages/{pageId}/convert-mode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "SECURE", "epochs": 52}'
```

## Coverage

- ✅ Page CRUD operations
- ✅ Mode switching
- ✅ Storage management
- ✅ Pricing calculations
- ✅ Password reminders
- ✅ Profile integration

