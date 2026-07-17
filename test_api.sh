#!/bin/bash
BASE="http://localhost:3001"

echo "=== 1. Dev-login ==="
# Get token from redirect header, write to file
curl -s -D /tmp/headers.txt -o /dev/null "$BASE/auth/dev-login"
grep -i "location:" /tmp/headers.txt | sed 's/.*token=//' | tr -d '\r\n' > /tmp/thinkred_token.txt
TOKEN=*** /tmp/thinkred_token.txt)
echo "Token length: ${#TOKEN}"
echo "Token (first 40 chars): ${TOKEN:0:40}..."

echo ""
echo "=== 2. Verify token ==="
curl -s -H "Authorization: Bearer *** "$BASE/auth/verify" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== 3. Game state ==="
curl -s -H "Authorization: Bearer *** "$BASE/api/game/state" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== 4. Enterprise types ==="
curl -s -H "Authorization: Bearer *** "$BASE/api/game/enterprise-types" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== 5. Create enterprise ==="
curl -s -X POST \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{"name":"Красная мануфактура","type":"manufactory","location":"Москва"}' \
  "$BASE/api/game/enterprises" | python3 -m json.tool 2>/dev/null

# Get enterprise ID
ENT_ID=*** -H "Authorization: Bearer *** "$BASE/api/game/enterprises" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)
echo "Enterprise ID: $ENT_ID"

echo ""
echo "=== 6. Decision: wage_change ==="
curl -s -X POST \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{"type":"wage_change","value":120}' \
  "$BASE/api/game/enterprises/$ENT_ID/decisions" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== 7. Decision: investment ==="
curl -s -X POST \
  -H "Authorization: Bearer *** \
  -H "Content-Type: application/json" \
  -d '{"type":"investment","value":5000}' \
  "$BASE/api/game/enterprises/$ENT_ID/decisions" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== 8. Events ==="
curl -s -H "Authorization: Bearer *** "$BASE/api/game/events" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== 9. Economic indicators ==="
curl -s -H "Authorization: Bearer *** "$BASE/api/game/economy" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== 10. Market state ==="
curl -s -H "Authorization: Bearer *** "$BASE/api/game/market" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== 11. Final game state ==="
curl -s -H "Authorization: Bearer *** "$BASE/api/game/state" | python3 -m json.tool 2>/dev/null

echo ""
echo "=== DONE ==="
