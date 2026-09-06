import requests

# Login as Admin
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "devavardhan.test@gmail.com", "password": "Owner@123"},
    timeout=10
)
token = response.json()['access_token']
headers = {"Authorization": f"Bearer {token}"}

# Test various endpoints
endpoints = [
    "/api/v1/users",
    "/api/v1/assets",
    "/api/v1/transfers",
    "/api/v1/dids",
    "/api/v1/audit",
    "/api/v1/blockchain/status",
    "/api/v1/blockchain/transactions",
    "/api/v1/security",
    "/api/v1/security/stats",
    "/api/v1/dashboard/stats",
]

print("Testing Admin access to endpoints:")
for ep in endpoints:
    try:
        response = requests.get(f"http://localhost:8000{ep}", headers=headers, timeout=10)
        print(f"  {ep}: {response.status_code} - {'OK' if response.status_code < 400 else 'ERROR'}")
        if response.status_code >= 400:
            print(f"    Error: {response.text[:200]}")
    except Exception as e:
        print(f"  {ep}: ERROR - {e}")

# Login as User One
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "user1@securechain.com", "password": "User@123"},
    timeout=10
)
token = response.json()['access_token']
headers = {"Authorization": f"Bearer {token}"}

print("\nTesting User access to endpoints:")
for ep in endpoints:
    try:
        response = requests.get(f"http://localhost:8000{ep}", headers=headers, timeout=10)
        print(f"  {ep}: {response.status_code} - {'OK' if response.status_code < 400 else 'ERROR (expected for some)'}")
        if response.status_code >= 400:
            print(f"    Error: {response.text[:200]}")
    except Exception as e:
        print(f"  {ep}: ERROR - {e}")