#!/usr/bin/env python3
"""Test compatibility with existing passlib-generated hashes"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from passlib.context import CryptContext
from app.auth import verify_password

# Create a hash using OLD method (passlib)
pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')
old_hash = pwd_ctx.hash('Owner@123')

print("="*60)
print("Testing Backward Compatibility")
print("="*60)
print(f"\nOld passlib hash: {old_hash[:40]}...")

# Try to verify with NEW method (direct bcrypt)
try:
    result = verify_password('Owner@123', old_hash)
    print(f"New verify_password() with old hash: {'[OK] Works!' if result else '[FAIL] Failed'}")
    
    # Test wrong password
    wrong_result = verify_password('WrongPassword', old_hash)
    print(f"Wrong password rejected: {'[OK] Correctly rejected' if not wrong_result else '[FAIL] Incorrectly accepted'}")
    
    if result and not wrong_result:
        print("\n[PASS] Backward compatibility maintained!")
        print("Existing database hashes will work with new code.")
        sys.exit(0)
    else:
        print("\n[FAIL] Backward compatibility broken!")
        sys.exit(1)
        
except Exception as e:
    print(f"[ERROR] {e}")
    sys.exit(1)
