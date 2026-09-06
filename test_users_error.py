import requests

# Test login as Admin
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "devavardhan.test@gmail.com", "password": "Owner@123"},
    timeout=10
)
token = response.json()['access_token']
headers = {"Authorization": f"Bearer {token}"}

# Test users endpoint with accept header
headers["Accept"] = "application/json"
response = requests.get("http://localhost:8000/api/v1/users", headers=headers, timeout=10)
print(f"Users: {response.status_code}")
print(response.text[:500])