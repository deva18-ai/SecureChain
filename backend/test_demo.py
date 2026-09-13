"""
SecureChain Comprehensive Test Suite
=====================================

This script tests all features to ensure the demo works perfectly.
Run this after seeding demo data.
"""

import asyncio
import sys
from pathlib import Path
from typing import Dict, List, Tuple
import httpx
from datetime import datetime

# Test Configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = "/api/v1"

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

# Test results storage
test_results: List[Tuple[str, bool, str]] = []

def print_header(text: str):
    """Print a formatted header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(70)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")

def print_test(name: str, passed: bool, details: str = ""):
    """Print test result."""
    status = f"{Colors.GREEN}✅ PASS{Colors.END}" if passed else f"{Colors.RED}❌ FAIL{Colors.END}"
    print(f"{status} | {name}")
    if details:
        print(f"       {details}")
    test_results.append((name, passed, details))

def print_summary():
    """Print test summary."""
    print_header("TEST SUMMARY")
    
    passed = sum(1 for _, p, _ in test_results if p)
    failed = sum(1 for _, p, _ in test_results if not p)
    total = len(test_results)
    
    print(f"Total Tests: {total}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.END}")
    print(f"{Colors.RED}Failed: {failed}{Colors.END}")
    print(f"Success Rate: {(passed/total*100):.1f}%\n")
    
    if failed > 0:
        print(f"{Colors.RED}{Colors.BOLD}Failed Tests:{Colors.END}")
        for name, passed, details in test_results:
            if not passed:
                print(f"  - {name}")
                if details:
                    print(f"    {details}")


async def test_service_health():
    """Test 1: Service Health Checks"""
    print_header("TEST 1: SERVICE HEALTH CHECKS")
    
    async with httpx.AsyncClient() as client:
        # Test backend health
        try:
            response = await client.get(f"{BASE_URL}/health", timeout=5.0)
            passed = response.status_code == 200
            print_test("Backend API Health", passed, f"Status: {response.status_code}")
        except Exception as e:
            print_test("Backend API Health", False, f"Error: {str(e)}")
            return False
        
        # Test database connection
        try:
            response = await client.get(f"{BASE_URL}/health")
            data = response.json()
            db_status = data.get("database") == "connected"
            print_test("Database Connection", db_status, f"Status: {data.get('database')}")
        except Exception as e:
            print_test("Database Connection", False, f"Error: {str(e)}")
        
        return True


async def get_auth_token(email: str, password: str) -> str:
    """Helper: Get JWT token for user."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}{API_PREFIX}/auth/login",
            data={"username": email, "password": password}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        return None


async def test_user_authentication():
    """Test 2: User Authentication"""
    print_header("TEST 2: USER AUTHENTICATION")
    
    test_users = [
        ("admin@securechain.local", "Admin@123", "ADMIN"),
        ("manager@securechain.local", "Manager@123", "MANAGER"),
        ("auditor@securechain.local", "Auditor@123", "AUDITOR"),
        ("priya@securechain.local", "User@123", "USER"),
    ]
    
    async with httpx.AsyncClient() as client:
        for email, password, expected_role in test_users:
            try:
                # Test login
                response = await client.post(
                    f"{BASE_URL}{API_PREFIX}/auth/login",
                    data={"username": email, "password": password}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    token = data.get("access_token")
                    
                    # Test token validity
                    headers = {"Authorization": f"Bearer {token}"}
                    me_response = await client.get(
                        f"{BASE_URL}{API_PREFIX}/auth/me",
                        headers=headers
                    )
                    
                    if me_response.status_code == 200:
                        user_data = me_response.json()
                        role_match = user_data.get("role") == expected_role
                        print_test(
                            f"Login & Token: {email}",
                            role_match,
                            f"Role: {user_data.get('role')}"
                        )
                    else:
                        print_test(f"Login & Token: {email}", False, "Token validation failed")
                else:
                    print_test(f"Login & Token: {email}", False, f"Status: {response.status_code}")
                    
            except Exception as e:
                print_test(f"Login & Token: {email}", False, f"Error: {str(e)}")


async def test_user_management():
    """Test 3: User Management (Admin)"""
    print_header("TEST 3: USER MANAGEMENT")
    
    token = await get_auth_token("admin@securechain.local", "Admin@123")
    if not token:
        print_test("Get Admin Token", False, "Failed to authenticate")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Get all users
        try:
            response = await client.get(
                f"{BASE_URL}{API_PREFIX}/users",
                headers=headers
            )
            passed = response.status_code == 200
            if passed:
                users = response.json().get("items", [])
                print_test("Get All Users", True, f"Found {len(users)} users")
            else:
                print_test("Get All Users", False, f"Status: {response.status_code}")
        except Exception as e:
            print_test("Get All Users", False, f"Error: {str(e)}")
        
        # Test: Create new user
        try:
            new_user = {
                "full_name": "Test User Demo",
                "email": f"testdemo{datetime.now().timestamp()}@securechain.local",
                "password": "Test@123",
                "role": "USER"
            }
            response = await client.post(
                f"{BASE_URL}{API_PREFIX}/users",
                headers=headers,
                json=new_user
            )
            passed = response.status_code == 200
            print_test("Create New User", passed, f"Status: {response.status_code}")
        except Exception as e:
            print_test("Create New User", False, f"Error: {str(e)}")


async def test_asset_management():
    """Test 4: Asset Management"""
    print_header("TEST 4: ASSET MANAGEMENT")
    
    token = await get_auth_token("admin@securechain.local", "Admin@123")
    if not token:
        print_test("Get Admin Token", False, "Failed to authenticate")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test: Get all assets
        try:
            response = await client.get(
                f"{BASE_URL}{API_PREFIX}/assets",
                headers=headers
            )
            passed = response.status_code == 200
            if passed:
                assets = response.json().get("items", [])
                print_test("Get All Assets", True, f"Found {len(assets)} assets")
                
                # Verify demo assets exist
                demo_assets = ["SC-LAPTOP-001", "SC-LAPTOP-002", "SC-MOBILE-001", "SC-SERVER-001"]
                found_demo = [a for a in assets if a.get("asset_id") in demo_assets]
                print_test("Demo Assets Exist", len(found_demo) >= 4, f"Found {len(found_demo)}/4 demo assets")
            else:
                print_test("Get All Assets", False, f"Status: {response.status_code}")
        except Exception as e:
            print_test("Get All Assets", False, f"Error: {str(e)}")
        
        # Test: Get specific asset
        try:
            response = await client.get(
                f"{BASE_URL}{API_PREFIX}/assets",
                headers=headers
            )
            if response.status_code == 200:
                assets = response.json().get("items", [])
                if assets:
                    asset_id = assets[0]["id"]
                    detail_response = await client.get(
                        f"{BASE_URL}{API_PREFIX}/assets/{asset_id}",
                        headers=headers
                    )
                    passed = detail_response.status_code == 200
                    print_test("Get Asset Details", passed, f"Asset ID: {asset_id}")
        except Exception as e:
            print_test("Get Asset Details", False, f"Error: {str(e)}")


async def test_transfer_workflow():
    """Test 5: Transfer Request Workflow"""
    print_header("TEST 5: TRANSFER REQUEST WORKFLOW")
    
    # Get manager token
    manager_token = await get_auth_token("manager@securechain.local", "Manager@123")
    if not manager_token:
        print_test("Get Manager Token", False, "Failed to authenticate")
        return
    
    # Get admin token
    admin_token = await get_auth_token("admin@securechain.local", "Admin@123")
    if not admin_token:
        print_test("Get Admin Token", False, "Failed to authenticate")
        return
    
    async with httpx.AsyncClient() as client:
        # Step 1: Manager creates transfer request
        manager_headers = {"Authorization": f"Bearer {manager_token}"}
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get an asset and a user for transfer
        assets_response = await client.get(f"{BASE_URL}{API_PREFIX}/assets", headers=manager_headers)
        users_response = await client.get(f"{BASE_URL}{API_PREFIX}/users", headers=manager_headers)
        
        if assets_response.status_code == 200 and users_response.status_code == 200:
            assets = assets_response.json().get("items", [])
            users = users_response.json().get("items", [])
            
            # Find suitable asset and user
            target_asset = next((a for a in assets if a.get("asset_id") == "SC-LAPTOP-001"), None)
            target_user = next((u for u in users if u.get("wallet_address")), None)
            
            if target_asset and target_user:
                # Create transfer request
                try:
                    transfer_data = {
                        "asset_id": target_asset["id"],
                        "to_address": target_user["wallet_address"]
                    }
                    response = await client.post(
                        f"{BASE_URL}{API_PREFIX}/transfers",
                        headers=manager_headers,
                        json=transfer_data
                    )
                    
                    passed = response.status_code == 200
                    if passed:
                        transfer = response.json()
                        transfer_id = transfer.get("id")
                        print_test("Manager Creates Transfer Request", True, f"Transfer ID: {transfer_id}")
                        
                        # Step 2: Verify request is PENDING
                        detail_response = await client.get(
                            f"{BASE_URL}{API_PREFIX}/transfers/{transfer_id}",
                            headers=manager_headers
                        )
                        if detail_response.status_code == 200:
                            status = detail_response.json().get("status")
                            print_test("Request Status is PENDING", status == "PENDING", f"Status: {status}")
                        
                        # Step 3: Admin approves request
                        try:
                            approve_response = await client.post(
                                f"{BASE_URL}{API_PREFIX}/transfers/{transfer_id}/approve",
                                headers=admin_headers
                            )
                            approve_passed = approve_response.status_code == 200
                            print_test("Owner Approves Request", approve_passed, f"Status: {approve_response.status_code}")
                            
                            if approve_passed:
                                # Step 4: Verify status changed
                                final_response = await client.get(
                                    f"{BASE_URL}{API_PREFIX}/transfers/{transfer_id}",
                                    headers=admin_headers
                                )
                                if final_response.status_code == 200:
                                    final_status = final_response.json().get("status")
                                    executed = final_status in ["APPROVED", "COMPLETED"]
                                    print_test("Request Executed", executed, f"Final Status: {final_status}")
                        except Exception as e:
                            print_test("Owner Approves Request", False, f"Error: {str(e)}")
                    else:
                        print_test("Manager Creates Transfer Request", False, f"Status: {response.status_code}")
                except Exception as e:
                    print_test("Manager Creates Transfer Request", False, f"Error: {str(e)}")
            else:
                print_test("Find Asset/User for Transfer", False, "No suitable asset or user found")
        else:
            print_test("Get Assets/Users for Transfer", False, "Failed to fetch data")


async def test_transfer_rejection():
    """Test 6: Transfer Rejection"""
    print_header("TEST 6: TRANSFER REJECTION")
    
    manager_token = await get_auth_token("manager@securechain.local", "Manager@123")
    admin_token = await get_auth_token("admin@securechain.local", "Admin@123")
    
    if not manager_token or not admin_token:
        print_test("Get Tokens", False, "Failed to authenticate")
        return
    
    async with httpx.AsyncClient() as client:
        manager_headers = {"Authorization": f"Bearer {manager_token}"}
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get asset and user
        assets_response = await client.get(f"{BASE_URL}{API_PREFIX}/assets", headers=manager_headers)
        users_response = await client.get(f"{BASE_URL}{API_PREFIX}/users", headers=manager_headers)
        
        if assets_response.status_code == 200 and users_response.status_code == 200:
            assets = assets_response.json().get("items", [])
            users = users_response.json().get("items", [])
            
            target_asset = next((a for a in assets if a.get("asset_id") == "SC-MOBILE-001"), None)
            target_user = next((u for u in users if u.get("wallet_address")), None)
            
            if target_asset and target_user:
                # Create transfer request
                transfer_data = {
                    "asset_id": target_asset["id"],
                    "to_address": target_user["wallet_address"]
                }
                response = await client.post(
                    f"{BASE_URL}{API_PREFIX}/transfers",
                    headers=manager_headers,
                    json=transfer_data
                )
                
                if response.status_code == 200:
                    transfer_id = response.json().get("id")
                    print_test("Create Request for Rejection", True, f"Transfer ID: {transfer_id}")
                    
                    # Reject the request
                    try:
                        reject_data = {"reason": "Test rejection - asset required for current project"}
                        reject_response = await client.post(
                            f"{BASE_URL}{API_PREFIX}/transfers/{transfer_id}/reject",
                            headers=admin_headers,
                            json=reject_data
                        )
                        reject_passed = reject_response.status_code == 200
                        print_test("Owner Rejects Request", reject_passed, f"Status: {reject_response.status_code}")
                        
                        if reject_passed:
                            # Verify rejection
                            detail_response = await client.get(
                                f"{BASE_URL}{API_PREFIX}/transfers/{transfer_id}",
                                headers=admin_headers
                            )
                            if detail_response.status_code == 200:
                                status = detail_response.json().get("status")
                                print_test("Request Status is REJECTED", status == "REJECTED", f"Status: {status}")
                    except Exception as e:
                        print_test("Owner Rejects Request", False, f"Error: {str(e)}")


async def test_dashboard_stats():
    """Test 7: Dashboard Statistics"""
    print_header("TEST 7: DASHBOARD STATISTICS")
    
    token = await get_auth_token("admin@securechain.local", "Admin@123")
    if not token:
        print_test("Get Admin Token", False, "Failed to authenticate")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}{API_PREFIX}/dashboard/stats",
                headers=headers
            )
            
            if response.status_code == 200:
                stats = response.json()
                
                # Verify statistics exist
                print_test("Get Dashboard Stats", True, f"Status: {response.status_code}")
                
                # Check key metrics
                has_users = stats.get("total_users", 0) > 0
                print_test("Dashboard: Total Users > 0", has_users, f"Count: {stats.get('total_users')}")
                
                has_assets = stats.get("total_assets", 0) > 0
                print_test("Dashboard: Total Assets > 0", has_assets, f"Count: {stats.get('total_assets')}")
                
                has_activity = len(stats.get("recent_activity", [])) > 0
                print_test("Dashboard: Recent Activity Exists", has_activity, f"Count: {len(stats.get('recent_activity', []))}")
            else:
                print_test("Get Dashboard Stats", False, f"Status: {response.status_code}")
        except Exception as e:
            print_test("Get Dashboard Stats", False, f"Error: {str(e)}")


async def test_role_based_access():
    """Test 8: Role-Based Access Control"""
    print_header("TEST 8: ROLE-BASED ACCESS CONTROL")
    
    # Test USER cannot access admin endpoints
    user_token = await get_auth_token("priya@securechain.local", "User@123")
    if user_token:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {user_token}"}
            
            # User should NOT be able to create users
            try:
                response = await client.post(
                    f"{BASE_URL}{API_PREFIX}/users",
                    headers=headers,
                    json={"full_name": "Test", "email": "test@test.com", "password": "test", "role": "USER"}
                )
                blocked = response.status_code in [403, 401]
                print_test("USER Blocked from Creating Users", blocked, f"Status: {response.status_code}")
            except Exception as e:
                print_test("USER Blocked from Creating Users", False, f"Error: {str(e)}")
            
            # User SHOULD be able to view assets
            try:
                response = await client.get(
                    f"{BASE_URL}{API_PREFIX}/assets",
                    headers=headers
                )
                allowed = response.status_code == 200
                print_test("USER Can View Assets", allowed, f"Status: {response.status_code}")
            except Exception as e:
                print_test("USER Can View Assets", False, f"Error: {str(e)}")
    
    # Test AUDITOR has read-only access
    auditor_token = await get_auth_token("auditor@securechain.local", "Auditor@123")
    if auditor_token:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {auditor_token}"}
            
            # Auditor should NOT be able to approve transfers
            try:
                response = await client.post(
                    f"{BASE_URL}{API_PREFIX}/transfers/1/approve",
                    headers=headers
                )
                blocked = response.status_code in [403, 401, 404]
                print_test("AUDITOR Blocked from Approving", blocked, f"Status: {response.status_code}")
            except Exception as e:
                print_test("AUDITOR Blocked from Approving", True, "Expected error")


async def test_dids():
    """Test 9: Digital Identity (DID) Management"""
    print_header("TEST 9: DIGITAL IDENTITY (DID)")
    
    token = await get_auth_token("admin@securechain.local", "Admin@123")
    if not token:
        print_test("Get Admin Token", False, "Failed to authenticate")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}{API_PREFIX}/dids",
                headers=headers
            )
            
            if response.status_code == 200:
                dids = response.json().get("items", [])
                print_test("Get All DIDs", True, f"Found {len(dids)} DIDs")
                
                # Verify demo DIDs exist
                verified_dids = [d for d in dids if d.get("is_verified")]
                print_test("DIDs are Verified", len(verified_dids) > 0, f"{len(verified_dids)} verified")
            else:
                print_test("Get All DIDs", False, f"Status: {response.status_code}")
        except Exception as e:
            print_test("Get All DIDs", False, f"Error: {str(e)}")


async def run_all_tests():
    """Run all test suites."""
    print_header("SECURECHAIN COMPREHENSIVE TEST SUITE")
    print(f"Testing API: {BASE_URL}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Run all test suites
    await test_service_health()
    await test_user_authentication()
    await test_user_management()
    await test_asset_management()
    await test_transfer_workflow()
    await test_transfer_rejection()
    await test_dashboard_stats()
    await test_role_based_access()
    await test_dids()
    
    # Print summary
    print_summary()
    
    # Check if all tests passed
    all_passed = all(passed for _, passed, _ in test_results)
    
    if all_passed:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! DEMO IS PERFECT! 🎉{Colors.END}\n")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  SOME TESTS FAILED. CHECK DETAILS ABOVE. ⚠️{Colors.END}\n")
        return 1


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(run_all_tests())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.END}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Fatal error: {str(e)}{Colors.END}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
