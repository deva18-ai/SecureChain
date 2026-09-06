#!/usr/bin/env python3
"""
Test password hashing and verification for SecureChain authentication.
Tests the bcrypt implementation in app.auth module.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.auth import get_password_hash, verify_password


def test_password_hash_and_verify():
    """Test that password hashing and verification works correctly."""
    # Test with actual seeded passwords
    test_passwords = [
        'Owner@123',
        'Manager@123',
        'User@123',
        'Demo@123',
    ]
    
    print("="*60)
    print("SecureChain Password Hashing Test")
    print("="*60)
    
    all_passed = True
    
    for password in test_passwords:
        print(f"\nTesting password: {password}")
        
        try:
            # Hash the password
            hashed = get_password_hash(password)
            print(f"  [OK] Hashed: {hashed[:30]}...")
            
            # Verify correct password
            if verify_password(password, hashed):
                print(f"  [OK] Verification successful")
            else:
                print(f"  [FAIL] Verification FAILED - correct password not accepted")
                all_passed = False
            
            # Verify incorrect password fails
            if not verify_password('wrong_password', hashed):
                print(f"  [OK] Wrong password correctly rejected")
            else:
                print(f"  [FAIL] Wrong password incorrectly accepted")
                all_passed = False
                
        except Exception as e:
            print(f"  [ERROR] {e}")
            all_passed = False
    
    # Test edge cases
    print(f"\nEdge case tests:")
    
    # Long password (>72 bytes)
    long_password = 'a' * 100
    print(f"  Testing long password ({len(long_password)} chars)...")
    try:
        hashed_long = get_password_hash(long_password)
        if verify_password(long_password, hashed_long):
            print(f"  [OK] Long password works")
        else:
            print(f"  [FAIL] Long password verification failed")
            all_passed = False
    except Exception as e:
        print(f"  [ERROR] Long password: {e}")
        all_passed = False
    
    # Special characters
    special_password = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    print(f"  Testing special characters password...")
    try:
        hashed_special = get_password_hash(special_password)
        if verify_password(special_password, hashed_special):
            print(f"  [OK] Special characters work")
        else:
            print(f"  [FAIL] Special characters verification failed")
            all_passed = False
    except Exception as e:
        print(f"  [ERROR] Special characters: {e}")
        all_passed = False
    
    print("\n" + "="*60)
    if all_passed:
        print("[PASS] ALL TESTS PASSED")
        print("="*60)
        return 0
    else:
        print("[FAIL] SOME TESTS FAILED")
        print("="*60)
        return 1


if __name__ == "__main__":
    exit_code = test_password_hash_and_verify()
    sys.exit(exit_code)
