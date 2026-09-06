import requests

# Login as Admin
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "devavardhan.test@gmail.com", "password": "Owner@123"},
    timeout=10
)
token = response.json()['access_token']
headers = {"Authorization": f"Bearer {token}"}

# Test specific endpoints with error details
endpoints = [
    "/api/v1/users",
    "/api/v1/assets",
    "/api/v1/transfers",
    "/api/v1/dids",
    "/api/v1/audit",
    "/api/v1/security",
    "/api/v1/security/stats",
]

print("Testing Admin access to endpoints with full error details:")
for ep in endpoints:
    try:
        response = requests.get(f"http://localhost:8000{ep}", headers=headers, timeout=10)
        print(f"\n=== {ep} ===")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            if isinstance(data, dict):
                print(f"Keys: {list(data.keys())}")
            elif isinstance(data, list):
                print(f"Length: {len(data)}")
        else:
            print(f"Error: {response.text[:500]}")
    except Exception as e:
        print(f"  {ep}: ERROR - {e}")