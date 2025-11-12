#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Notely API Testing ===${NC}\n"

# Check if TOKEN is set
if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠️  TOKEN not set!${NC}"
  echo ""
  echo "To get token:"
  echo "1. Create user in Supabase Dashboard → Authentication → Users"
  echo "2. Or use browser console in Supabase Dashboard:"
  echo ""
  echo "   const { createClient } = supabase"
  echo "   const supabase = createClient('YOUR_URL', 'YOUR_KEY')"
  echo "   supabase.auth.signInWithPassword({email:'test@test.com', password:'test123'})"
  echo "     .then(({data}) => console.log(data.session.access_token))"
  echo ""
  echo "3. Then run: export TOKEN='your-token-here'"
  echo ""
  exit 1
fi

BASE_URL="http://localhost:3000"

echo -e "${GREEN}1. Testing GET /auth/me${NC}"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/me" | jq '.' || curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/me"
echo -e "\n"

echo -e "${GREEN}2. Testing GET /profile${NC}"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/profile" | jq '.' || curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/profile"
echo -e "\n"

echo -e "${GREEN}3. Testing GET /pages${NC}"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/pages" | jq '.' || curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/pages"
echo -e "\n"

echo -e "${GREEN}4. Testing POST /pages${NC}"
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"My Test Page"}' "$BASE_URL/pages" | jq '.' || \
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"My Test Page"}' "$BASE_URL/pages"
echo -e "\n"

echo -e "${GREEN}✅ Testing complete!${NC}"
