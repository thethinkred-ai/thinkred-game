import urllib.request
import json

BASE = "http://localhost:3001"

def api_get(path, token=None):
    req = urllib.request.Request(f"{BASE}{path}")
    if token:
        req.add_header("Authorization", f"Bearer ***")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()}

def api_post(path, data, token=None):
    req = urllib.request.Request(f"{BASE}{path}", 
        data=json.dumps(data).encode(), 
        headers={"Content-Type": "application/json"})
    if token:
        req.add_header("Authorization", f"Bearer ***")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()}

# 1. Dev-login - get token from redirect
print("=== 1. Dev-login ===")
req = urllib.request.Request(f"{BASE}/auth/dev-login")
try:
    # Don't follow redirect
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            raise urllib.error.HTTPError(newurl, code, msg, headers, fp)
    opener = urllib.request.build_opener(NoRedirect)
    resp = opener.open(req)
except urllib.error.HTTPError as e:
    location = e.headers.get("Location", "")
    print(f"Redirect to: {location[:80]}...")
    # Extract token
    if "token=" in location:
        token = location.split("token=")[1].split("&")[0]
        print(f"Token length: {len(token)}")
        print(f"Token start: {token[:40]}...")
    else:
        print("No token in redirect!")
        exit(1)

# 2. Verify
print("\n=== 2. Verify token ===")
result = api_get("/auth/verify", token)
print(json.dumps(result, indent=2, ensure_ascii=False))
user_id = result.get("user", {}).get("id")
print(f"User ID: {user_id}")

# 3. Game state
print("\n=== 3. Game state ===")
state = api_get("/api/game/state", token)
print(json.dumps(state, indent=2, ensure_ascii=False))

# 4. Enterprise types
print("\n=== 4. Enterprise types ===")
types = api_get("/api/game/enterprise-types", token)
print(json.dumps(types, indent=2, ensure_ascii=False))

# 5. Create enterprise
print("\n=== 5. Create enterprise ===")
ent = api_post("/api/game/enterprises", {
    "name": "Красная мануфактура",
    "type": "manufactory", 
    "location": "Москва"
}, token)
print(json.dumps(ent, indent=2, ensure_ascii=False))
ent_id = ent.get("id", "")
print(f"Enterprise ID: {ent_id}")

# 6. Decision: wage_change
print("\n=== 6. Decision: wage_change ===")
dec1 = api_post(f"/api/game/enterprises/{ent_id}/decisions", {
    "type": "wage_change", "value": 120
}, token)
print(json.dumps(dec1, indent=2, ensure_ascii=False))

# 7. Decision: investment
print("\n=== 7. Decision: investment ===")
dec2 = api_post(f"/api/game/enterprises/{ent_id}/decisions", {
    "type": "investment", "value": 5000
}, token)
print(json.dumps(dec2, indent=2, ensure_ascii=False))

# 8. Events
print("\n=== 8. Events ===")
events = api_get("/api/game/events", token)
print(json.dumps(events, indent=2, ensure_ascii=False))

# 9. Economic indicators
print("\n=== 9. Economic indicators ===")
econ = api_get("/api/game/economy", token)
print(json.dumps(econ, indent=2, ensure_ascii=False))

# 10. Market state
print("\n=== 10. Market state ===")
market = api_get("/api/game/market", token)
print(json.dumps(market, indent=2, ensure_ascii=False))

# 11. Progress
print("\n=== 11. Progress ===")
prog = api_get("/api/game/progress", token)
print(json.dumps(prog, indent=2, ensure_ascii=False))

# 12. Final game state
print("\n=== 12. Final game state ===")
final = api_get("/api/game/state", token)
print(json.dumps(final, indent=2, ensure_ascii=False))

print("\n=== ALL TESTS DONE ===")
