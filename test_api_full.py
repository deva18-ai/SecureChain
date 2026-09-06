import requests
import time

# Wait for server
time.sleep(2)

# Test health
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    print(f"Health: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"Health check failed: {e}")

# Test login as Admin
try:
    response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        json={"email": "devavardhan.test@gmail.com", "password": "Owner@123"},
        timeout=10
    )
    print(f"\nAdmin login: {response.status_code}")
    if response.status_code == 200:
        token = response.json()['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test users endpoint
        response = requests.get("http://localhost:8000/api/v1/users", headers=headers, timeout=10)
        print(f"Users endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Total: {data.get('total')}, Items: {len(data.get('items', []))}")
        else:
            print(f"  Error: {response.text[:200]}")
        
        # Test assets endpoint
        response = requests.get("http://localhost:8000/api/v1/assets", headers=headers, timeout=10)
        print(f"Assets endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Total: {data.get('total')}, Items: {len(data.get('items', []))}")
        else:
            print(f"  Error: {response.text[:200]}")
            
        # Test transfers endpoint
        response = requests.get("http://localhost:8000/api/v1/transfers", headers=headers, timeout=10)
        print(f"Transfers endpoint: {response.status_code}")
        
        # Test audit endpoint
        response = requests.get("http://localhost:8000/api/v1/audit", headers=headers, timeout=10)
        print(f"Audit endpoint: {response.status_code}")
        
        # Test blockchain endpoint
        response = requests.get("http://localhost:8000/api/v1/blockchain/status", headers=headers, timeout=10)
        print(f"Blockchain status: {response.status_code}")
        
        # Test security endpoint
        response = requests.get("http://localhost:8000/api/v1/security", headers=headers, timeout=10)
        print(f"Security endpoint: {response.status_code}")
        
        # Test dashboard stats
        response = requests.get("http://localhost:8000/api/v1/dashboard/stats", headers=headers, timeout=10)
        print(f"Dashboard stats: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Total users: {data.get('total_users')}, Total assets: {data.get('total_assets')}")
        
    else:
        print(f"  Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")