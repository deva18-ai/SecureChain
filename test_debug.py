import requests

# Login as Admin
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "devavardhan.test@gmail.com", "password": "Owner@123"},
    timeout=10
)
token = response.json()['access_token']
headers = {"Authorization": f"Bearer {token}"}

# Test with Accept header
headers["Accept"] = "application/json"

# Test one endpoint
response = requests.get("http://localhost:8000/api/v1/users", headers=headers, timeout=10)
print(f"Status: {response.status_code}")
print(f"Headers: {dict(response.headers)}")
print(f"Text: {response.text[:1000]}")