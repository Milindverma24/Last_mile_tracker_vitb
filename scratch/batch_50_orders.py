import urllib.request
import json
import time
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://localhost:8088/api"

# 1. Admin login & reset
req = urllib.request.Request(f"{BASE_URL}/auth/login", data=json.dumps({"email":"admin@gatiman.com","password":"password123"}).encode(), headers={"Content-Type":"application/json"})
with urllib.request.urlopen(req) as resp:
    admin_token = json.loads(resp.read().decode())["data"]["token"]

reset_req = urllib.request.Request(f"{BASE_URL}/admin/system/reset-data", data=b"", headers={"Authorization": f"Bearer {admin_token}"})
with urllib.request.urlopen(reset_req) as resp:
    print("Database reset:", json.loads(resp.read().decode())["message"])

# 2. Register & Login 50 Users
def auth_user(i):
    email = f"loaduser_{i}@gatiman.test"
    reg_data = json.dumps({
        "email": email, "password": "password123", "firstName": "Load", "lastName": f"User {i}",
        "phoneNumber": f"+91 98000{i:05d}", "address": f"Plot {i}", "city": "New Delhi", "state": "Delhi", "pinCode": "110016"
    }).encode()
    try:
        urllib.request.urlopen(urllib.request.Request(f"{BASE_URL}/auth/register", data=reg_data, headers={"Content-Type":"application/json"}))
    except Exception:
        pass
    
    login_data = json.dumps({"email": email, "password": "password123"}).encode()
    with urllib.request.urlopen(urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data, headers={"Content-Type":"application/json"})) as resp:
        return i, json.loads(resp.read().decode())["data"]["token"]

print("Authenticating 50 users concurrently...")
with ThreadPoolExecutor(max_workers=10) as executor:
    tokens = dict(list(executor.map(auth_user, range(1, 51))))
print(f"Authenticated {len(tokens)} / 50 users.")

# 3. Concurrently place 50 orders
weights = [1.5, 2.5, 4.0, 8.0, 15.0, 24.0, 35.0, 50.0]
routes = [
    ("110016", "122002", "South Delhi -> Cyber City"),
    ("110001", "110016", "Connaught Place -> Hauz Khas"),
    ("110016", "201301", "South Delhi -> Noida Sec 18"),
    ("122002", "110001", "Cyber City -> Connaught Place"),
    ("110001", "201307", "Central Delhi -> Noida Sec 62"),
]

def place_order(item):
    i, token = item
    weight = weights[(i - 1) % len(weights)]
    p_pin, d_pin, r_name = routes[(i - 1) % len(routes)]
    order_data = json.dumps({
        "customerType": "B2C",
        "paymentType": "COD",
        "pickupName": f"User {i} Origin",
        "pickupPhone": f"+91 98000{i:05d}",
        "pickupAddress": f"Plot {i}, Tech Park",
        "pickupPincode": p_pin,
        "dropName": f"Recipient {i}",
        "dropPhone": f"+91 99000{i:05d}",
        "dropAddress": f"Tower {i}, Cyber City",
        "dropPincode": d_pin,
        "actualWeightKg": weight,
        "lengthCm": 20, "breadthCm": 15, "heightCm": 10,
        "packageDescription": f"Express Box #{i}"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/orders", data=order_data, headers={"Content-Type":"application/json", "Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())["data"]
            return {
                "idx": i,
                "tracking": data["trackingNumber"],
                "status": data["status"],
                "agent": data.get("assignedAgentName") or "Unassigned",
                "vehicle": data.get("assignedAgentVehicle") or "—",
                "weight": f"{weight}kg",
                "charge": f"₹{data['totalCharge']}",
                "route": r_name
            }
    except Exception as e:
        return {"idx": i, "error": str(e)}

print("Placing 50 concurrent orders with auto-dispatch...")
with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(place_order, tokens.items()))

successes = [r for r in results if "tracking" in r]
print(f"\n==========================================================================================")
print(f"🎉 CONCURRENT LOAD RESULTS: {len(successes)} / 50 ORDERS AUTONOMOUSLY CREATED & DISPATCHED")
print(f"==========================================================================================")
print(f"{'#':<4} | {'TRACKING ID':<20} | {'STATUS':<12} | {'DRIVER PARTNER':<18} | {'VEHICLE':<15} | {'WEIGHT':<8} | {'CHARGE':<9} | {'ROUTE':<30}")
print("-" * 125)
for r in sorted(successes, key=lambda x: x["idx"])[:20]:
    print(f"{r['idx']:<4} | {r['tracking']:<20} | {r['status']:<12} | {r['agent']:<18} | {r['vehicle']:<15} | {r['weight']:<8} | {r['charge']:<9} | {r['route']:<30}")
print(f"... and {len(successes) - 20} additional orders active across the delivery network.")

