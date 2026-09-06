import requests
try:
    response = requests.get("http://localhost:5173", timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Length: {len(response.text)}")
except Exception as e:
    print(f"Error: {e}")