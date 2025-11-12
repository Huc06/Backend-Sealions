#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:3000"

echo -e "${GREEN}=== Notely API Testing ===${NC}\n"

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠️  TOKEN not set!${NC}\n"
  echo "To get token:"
  echo "1. Disable email confirmation in Supabase Dashboard → Authentication → Settings"
  echo "2. Or create user in Dashboard with 'Auto Confirm User' enabled"
  echo "3. Then run:"
  echo ""
  echo 'export TOKEN=$(curl -s -X POST "https://mhjfgywtpauumlexnxfp.supabase.co/auth/v1/token?grant_type=password" \'
  echo '  -H "apikey: YOUR_KEY" \'
  echo '  -H "Content-Type: application/json" \'
  echo '  -d '"'"'{"email":"your@email.com","password":"yourpass"}'"'"' | jq -r ".access_token")'
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ Testing with token: ${TOKEN:0:30}...${NC}\n"

# Test 1: GET /auth/me
echo -e "${GREEN}1. GET /auth/me${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/me")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Status: $HTTP_STATUS"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 2: GET /profile
echo -e "${GREEN}2. GET /profile${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/profile")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Status: $HTTP_STATUS"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 3: PATCH /profile
echo -e "${GREEN}3. PATCH /profile${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}' "$BASE_URL/profile")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Status: $HTTP_STATUS"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 4: GET /pages
echo -e "${GREEN}4. GET /pages${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/pages")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Status: $HTTP_STATUS"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 5: POST /pages
echo -e "${GREEN}5. POST /pages${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Page"}' "$BASE_URL/pages")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Status: $HTTP_STATUS"
PAGE_ID=$(echo "$BODY" | jq -r '.id // empty' 2>/dev/null)
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Test 6: POST /blocks (if page was created)
if [ ! -z "$PAGE_ID" ]; then
  echo -e "${GREEN}6. POST /blocks${NC}"
  RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"TEXT\",\"content\":{\"text\":\"Hello World\"},\"pageId\":\"$PAGE_ID\",\"position\":0}" \
    "$BASE_URL/blocks")
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
  echo "Status: $HTTP_STATUS"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
fi

echo -e "${GREEN}✅ Testing complete!${NC}"
