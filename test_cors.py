import requests

# Test CORS by making a request with Origin header
headers = {
    "Origin": "http://localhost:5173",
    "Content-Type": "application/json"
}

response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "devavardhan.test@gmail.com", "password": "Owner@123"},
    headers=headers,
    timeout=10
)
print(f"Status: {response.status_code}")
print(f"CORS Headers:")
for h in response.headers:
    if 'access-control' in h.lower() or 'origin' in h.lower():
        print(f"  {h}: {response.headers[h]}")

if response.status_code == 200:
    print(f"Login successful: {response.json()}")
else:
    print(f"Error: {response.text}")