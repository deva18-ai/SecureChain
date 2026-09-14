import requests

token_res = requests.post('http://localhost:8000/api/v1/auth/login', json={'email':'devavardhan.test@gmail.com', 'password':'Owner@123'})
print("Login status:", token_res.status_code)
token = token_res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

for ep in ['/assets', '/users', '/transfers', '/audit', '/dids', '/security', '/blockchain/transactions', '/blockchain/status', '/dashboard/stats']:
    r = requests.get(f'http://localhost:8000/api/v1{ep}', headers=headers)
    print(f"{ep:30}: status={r.status_code}, len={len(r.content)}")
    if r.status_code != 200:
        print("  Error text:", r.text[:200])
    else:
        try:
            data = r.json()
            if isinstance(data, dict):
                total = data.get('total', len(data.get('items', [])))
                print(f"  Total/Items count: {total}")
        except Exception as e:
            print("  JSON Parse error:", e)
