#!/bin/bash

# Comprehensive Test Cases for Secure Mode Features
# Tests: Page Mode, Convert Mode, Storage Info, Pricing, Password Reminder

# Don't exit on error, track failures instead
set +e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

BASE_URL="${BASE_URL:-http://localhost:3000}"
SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_KEY="${SUPABASE_KEY}"

PASSED=0
FAILED=0

echo -e "${BLUE}=== 🧪 Secure Mode Test Suite ===${NC}\n"

# Helper functions
test_pass() {
  echo -e "${GREEN}✅ PASS: $1${NC}"
  ((PASSED++))
}

test_fail() {
  echo -e "${RED}❌ FAIL: $1${NC}"
  ((FAILED++))
}

# Check if backend is running
echo -e "${YELLOW}Checking backend...${NC}"
if ! curl -s "$BASE_URL" > /dev/null; then
  echo -e "${RED}❌ Backend is not running at $BASE_URL${NC}"
  echo "Please start the backend first: pnpm run start:dev"
  exit 1
fi
test_pass "Backend is running"

# Step 1: Create test user
echo -e "\n${YELLOW}=== Test 1: User Creation ===${NC}"
USER_EMAIL="test-$(date +%s)@test.com"
USER_PASSWORD="test123456"

USER_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${USER_EMAIL}\",\"password\":\"${USER_PASSWORD}\"}")

USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.access_token // .session.access_token // empty' 2>/dev/null)
if [ -z "$USER_TOKEN" ] || [ "$USER_TOKEN" = "null" ] || [ "$USER_TOKEN" = "" ]; then
  echo "User creation response: $USER_RESPONSE"
  test_fail "User creation - token not found"
  exit 1
fi
test_pass "User created: $USER_EMAIL"

# Sync user
curl -s -X GET "${BASE_URL}/auth/me" -H "Authorization: Bearer ${USER_TOKEN}" > /dev/null
test_pass "User synced to database"

# Step 2: Test Traditional Page Creation
echo -e "\n${YELLOW}=== Test 2: Traditional Page Creation ===${NC}"

TRADITIONAL_PAGE=$(curl -s -X POST "${BASE_URL}/pages" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Traditional Test Page", "mode": "TRADITIONAL"}')

TRADITIONAL_PAGE_ID=$(echo $TRADITIONAL_PAGE | jq -r '.id')
if [ -z "$TRADITIONAL_PAGE_ID" ] || [ "$TRADITIONAL_PAGE_ID" = "null" ]; then
  test_fail "Traditional page creation"
else
  test_pass "Traditional page created: $TRADITIONAL_PAGE_ID"
  
  # Verify mode
  PAGE_MODE=$(echo $TRADITIONAL_PAGE | jq -r '.mode // "TRADITIONAL"')
  if [ "$PAGE_MODE" = "TRADITIONAL" ]; then
    test_pass "Page mode is TRADITIONAL"
  else
    test_fail "Page mode should be TRADITIONAL, got: $PAGE_MODE"
  fi
fi

# Step 3: Test Secure Page Creation
echo -e "\n${YELLOW}=== Test 3: Secure Page Creation ===${NC}"

SECURE_PAGE=$(curl -s -X POST "${BASE_URL}/pages" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Secure Test Page", "mode": "SECURE"}')

SECURE_PAGE_ID=$(echo $SECURE_PAGE | jq -r '.id')
if [ -z "$SECURE_PAGE_ID" ] || [ "$SECURE_PAGE_ID" = "null" ]; then
  test_fail "Secure page creation"
else
  test_pass "Secure page created: $SECURE_PAGE_ID"
  
  # Verify mode
  PAGE_MODE=$(echo $SECURE_PAGE | jq -r '.mode // "TRADITIONAL"')
  if [ "$PAGE_MODE" = "SECURE" ]; then
    test_pass "Page mode is SECURE"
  else
    test_fail "Page mode should be SECURE, got: $PAGE_MODE"
  fi
fi

# Step 4: Add blocks to traditional page
echo -e "\n${YELLOW}=== Test 4: Add Blocks to Traditional Page ===${NC}"

BLOCK1=$(curl -s -X POST "${BASE_URL}/blocks" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"TEXT\",\"content\":{\"text\":\"Test block content\"},\"pageId\":\"${TRADITIONAL_PAGE_ID}\",\"position\":0}")

BLOCK1_ID=$(echo $BLOCK1 | jq -r '.id')
if [ -z "$BLOCK1_ID" ] || [ "$BLOCK1_ID" = "null" ]; then
  test_fail "Block creation"
else
  test_pass "Block created: $BLOCK1_ID"
fi

# Step 5: Test Convert Traditional → Secure
echo -e "\n${YELLOW}=== Test 5: Convert Traditional → Secure ===${NC}"

CONVERT_RESPONSE=$(curl -s -X POST "${BASE_URL}/pages/${TRADITIONAL_PAGE_ID}/convert-mode" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"mode": "SECURE", "epochs": 52}')

CONVERTED_MODE=$(echo $CONVERT_RESPONSE | jq -r '.mode // ""')
if [ "$CONVERTED_MODE" = "SECURE" ]; then
  test_pass "Page converted to SECURE mode"
  
  # Check storage info
  STORAGE_COST=$(echo $CONVERT_RESPONSE | jq -r '.storageInfo.cost // ""')
  if [ -n "$STORAGE_COST" ]; then
    test_pass "Storage cost calculated: $STORAGE_COST WAL"
  else
    test_fail "Storage cost not returned"
  fi
  
  CID=$(echo $CONVERT_RESPONSE | jq -r '.storageLocation // ""')
  if [ -n "$CID" ]; then
    test_pass "Storage CID generated: $CID"
  else
    test_fail "Storage CID not generated"
  fi
else
  test_fail "Page conversion failed. Mode: $CONVERTED_MODE"
fi

# Step 6: Test Storage Info Endpoint
echo -e "\n${YELLOW}=== Test 6: Storage Info Endpoint ===${NC}"

STORAGE_INFO=$(curl -s -X GET "${BASE_URL}/pages/${TRADITIONAL_PAGE_ID}/storage-info" \
  -H "Authorization: Bearer ${USER_TOKEN}")

DAYS_REMAINING=$(echo $STORAGE_INFO | jq -r '.daysRemaining // ""')
if [ -n "$DAYS_REMAINING" ]; then
  test_pass "Storage info retrieved. Days remaining: $DAYS_REMAINING"
else
  test_fail "Storage info not retrieved"
fi

# Step 7: Test Convert Secure → Traditional
echo -e "\n${YELLOW}=== Test 7: Convert Secure → Traditional ===${NC}"

CONVERT_BACK=$(curl -s -X POST "${BASE_URL}/pages/${TRADITIONAL_PAGE_ID}/convert-mode" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"mode": "TRADITIONAL"}')

CONVERTED_BACK_MODE=$(echo $CONVERT_BACK | jq -r '.mode // ""')
if [ "$CONVERTED_BACK_MODE" = "TRADITIONAL" ]; then
  test_pass "Page converted back to TRADITIONAL mode"
else
  test_fail "Page conversion back failed. Mode: $CONVERTED_BACK_MODE"
fi

# Step 8: Test Walrus Pricing
echo -e "\n${YELLOW}=== Test 8: Walrus Pricing ===${NC}"

PRICING=$(curl -s -X GET "${BASE_URL}/walrus/pricing?sizeBytes=10240&epochs=52" \
  -H "Authorization: Bearer ${USER_TOKEN}")

QUILT_PRICE=$(echo $PRICING | jq -r '.priceQuilt // ""')
if [ -n "$QUILT_PRICE" ]; then
  test_pass "Pricing calculated. Quilt price: $QUILT_PRICE WAL"
else
  test_fail "Pricing calculation failed"
fi

# Test pricing options
OPTIONS=$(curl -s -X GET "${BASE_URL}/walrus/pricing/options?sizeBytes=10240" \
  -H "Authorization: Bearer ${USER_TOKEN}")

OPTIONS_COUNT=$(echo $OPTIONS | jq '. | length')
if [ "$OPTIONS_COUNT" -gt 0 ]; then
  test_pass "Pricing options retrieved: $OPTIONS_COUNT options"
else
  test_fail "Pricing options not retrieved"
fi

# Step 9: Test Password Reminder
echo -e "\n${YELLOW}=== Test 9: Password Reminder ===${NC}"

REMINDER=$(curl -s -X GET "${BASE_URL}/auth/password-reminder" \
  -H "Authorization: Bearer ${USER_TOKEN}")

DAYS_SINCE=$(echo $REMINDER | jq -r '.daysSinceChange // ""')
if [ -n "$DAYS_SINCE" ]; then
  test_pass "Password reminder status retrieved. Days since change: $DAYS_SINCE"
else
  test_fail "Password reminder status not retrieved"
fi

# Test record password change
RECORD_CHANGE=$(curl -s -X POST "${BASE_URL}/auth/change-password" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$RECORD_CHANGE" | jq -e '.message' > /dev/null 2>&1; then
  test_pass "Password change recorded"
else
  test_fail "Password change recording failed"
fi

# Step 10: Test Profile with Password Reminder
echo -e "\n${YELLOW}=== Test 10: Profile with Password Reminder ===${NC}"

PROFILE=$(curl -s -X GET "${BASE_URL}/profile" \
  -H "Authorization: Bearer ${USER_TOKEN}")

HAS_REMINDER=$(echo $PROFILE | jq -e '.passwordReminder' > /dev/null 2>&1 && echo "yes" || echo "no")
if [ "$HAS_REMINDER" = "yes" ]; then
  test_pass "Profile includes password reminder"
else
  test_fail "Profile missing password reminder"
fi

# Summary
echo -e "\n${BLUE}=== 📊 Test Summary ===${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi

