import requests
import json

# Test login as Admin
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "devavardhan.test@gmail.com", "password": "Owner@123"},
    timeout=10
)
print(f"Admin login status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Token: {data['access_token'][:50]}...")
    token = data['access_token']
    
    # Test /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get("http://localhost:8000/api/v1/auth/me", headers=headers, timeout=10)
    print(f"/auth/me status: {me_response.status_code}")
    if me_response.status_code == 200:
        print(f"User: {me_response.json()}")
else:
    print(f"Error: {response.text}")

# Test login as Manager
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "recipient@test.com", "password": "Manager@123"},
    timeout=10
)
print(f"\nManager login status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Token: {data['access_token'][:50]}...")
    token = data['access_token']
    
    # Test /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get("http://localhost:8000/api/v1/auth/me", headers=headers, timeout=10)
    print(f"/auth/me status: {me_response.status_code}")
    if me_response.status_code == 200:
        print(f"User: {me_response.json()}")
else:
    print(f"Error: {response.text}")

# Test login as User One
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "user1@securechain.com", "password": "User@123"},
    timeout=10
)
print(f"\nUser One login status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Token: {data['access_token'][:50]}...")
    token = data['access_token']
    
    # Test /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get("http://localhost:8000/api/v1/auth/me", headers=headers, timeout=10)
    print(f"/auth/me status: {me_response.status_code}")
    if me_response.status_code == 200:
        print(f"User: {me_response.json()}")
else:
    print(f"Error: {response.text}")