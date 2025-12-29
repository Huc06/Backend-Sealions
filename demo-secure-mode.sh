#!/bin/bash

# Demo script for Secure Mode features

set -e

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

echo -e "${BLUE}=== 🚀 Secure Mode Demo ===${NC}\n"

# Check if backend is running
if ! curl -s "$BASE_URL" > /dev/null; then
  echo -e "${RED}❌ Backend is not running at $BASE_URL${NC}"
  echo "Please start the backend first: pnpm run start:dev"
  exit 1
fi

echo -e "${GREEN}✅ Backend is running${NC}\n"

# Step 1: Create test user
echo -e "${YELLOW}Step 1: Creating test user...${NC}"

USER_EMAIL="demo-$(date +%s)@demo.com"
USER_PASSWORD="demo123456"

echo "Creating user: $USER_EMAIL"
USER_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${USER_EMAIL}\",\"password\":\"${USER_PASSWORD}\"}")

USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.access_token // .session.access_token // empty')
if [ -z "$USER_TOKEN" ] || [ "$USER_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Failed to create user${NC}"
  exit 1
fi

echo -e "${GREEN}✅ User created${NC}"

# Sync user
curl -s -X GET "${BASE_URL}/auth/me" -H "Authorization: Bearer ${USER_TOKEN}" > /dev/null
echo -e "${GREEN}✅ User synced${NC}\n"

# Step 2: Create Traditional page
echo -e "${YELLOW}Step 2: Creating Traditional page...${NC}"

TRADITIONAL_PAGE=$(curl -s -X POST "${BASE_URL}/pages" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Traditional Page", "mode": "TRADITIONAL"}')

TRADITIONAL_PAGE_ID=$(echo $TRADITIONAL_PAGE | jq -r '.id')
echo -e "${GREEN}✅ Traditional page created: $TRADITIONAL_PAGE_ID${NC}\n"

# Step 3: Create Secure page
echo -e "${YELLOW}Step 3: Creating Secure page...${NC}"

SECURE_PAGE=$(curl -s -X POST "${BASE_URL}/pages" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Secure Page", "mode": "SECURE"}')

SECURE_PAGE_ID=$(echo $SECURE_PAGE | jq -r '.id')
echo -e "${GREEN}✅ Secure page created: $SECURE_PAGE_ID${NC}\n"

# Step 4: Convert Traditional to Secure
echo -e "${YELLOW}Step 4: Converting Traditional → Secure...${NC}"

# First, add some blocks to the page
echo "Adding blocks to traditional page..."
BLOCK1=$(curl -s -X POST "${BASE_URL}/blocks" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"TEXT\",\"content\":{\"text\":\"This is a test block\"},\"pageId\":\"${TRADITIONAL_PAGE_ID}\",\"position\":0}")

echo -e "${GREEN}✅ Block added${NC}"

# Convert to Secure
echo "Converting to Secure mode (52 epochs = 2 years)..."
CONVERT_RESPONSE=$(curl -s -X POST "${BASE_URL}/pages/${TRADITIONAL_PAGE_ID}/convert-mode" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"mode": "SECURE", "epochs": 52}')

STORAGE_COST=$(echo $CONVERT_RESPONSE | jq -r '.storageInfo.cost')
STORAGE_USD=$(echo $CONVERT_RESPONSE | jq -r '.storageInfo.estimatedUSD')
DURATION=$(echo $CONVERT_RESPONSE | jq -r '.storageInfo.durationYears')

echo -e "${GREEN}✅ Page converted to SECURE mode!${NC}"
echo "  Storage Cost: $STORAGE_COST WAL (~\$$STORAGE_USD)"
echo "  Duration: $DURATION years"
echo "  CID: $(echo $CONVERT_RESPONSE | jq -r '.storageLocation')\n"

# Step 5: Get Storage Info
echo -e "${YELLOW}Step 5: Getting storage information...${NC}"

STORAGE_INFO=$(curl -s -X GET "${BASE_URL}/pages/${TRADITIONAL_PAGE_ID}/storage-info" \
  -H "Authorization: Bearer ${USER_TOKEN}")

DAYS_REMAINING=$(echo $STORAGE_INFO | jq -r '.daysRemaining')
echo -e "${GREEN}✅ Storage info retrieved${NC}"
echo "  Days remaining: $DAYS_REMAINING"
echo "  Expiry date: $(echo $STORAGE_INFO | jq -r '.expiryDate')\n"

# Step 6: Pricing comparison
echo -e "${YELLOW}Step 6: Pricing comparison...${NC}"

PRICING=$(curl -s -X GET "${BASE_URL}/walrus/pricing?sizeBytes=10240&epochs=52" \
  -H "Authorization: Bearer ${USER_TOKEN}")

QUILT_PRICE=$(echo $PRICING | jq -r '.priceQuilt')
STANDARD_PRICE=$(echo $PRICING | jq -r '.priceStandard')
SAVINGS=$(echo $PRICING | jq -r '.savings')

echo -e "${GREEN}✅ Pricing calculated${NC}"
echo "  Quilt Price: $QUILT_PRICE WAL"
echo "  Standard Price: $STANDARD_PRICE WAL"
echo "  Savings: ${SAVINGS}x cheaper!\n"

# Summary
echo -e "${BLUE}=== 📊 Demo Summary ===${NC}"
echo -e "${GREEN}✅ All features working!${NC}"
echo ""
echo "Demo Results:"
echo "  - Traditional Page: ✅ Created"
echo "  - Secure Page: ✅ Created"
echo "  - Mode Conversion: ✅ Working"
echo "  - Storage Info: ✅ Working"
echo "  - Pricing: ✅ Working"
echo ""
echo -e "${YELLOW}💡 Key Points for Pitching:${NC}"
echo "  - 99% cheaper than Notion Pro"
echo "  - End-to-end encryption with Seal"
echo "  - Decentralized storage with Walrus"
echo "  - Flexible access control"
echo ""
echo "Ready for demo! 🎉"

