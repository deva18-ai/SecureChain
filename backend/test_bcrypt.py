#!/usr/bin/env python3
"""Test bcrypt compatibility"""

import bcrypt
from passlib.context import CryptContext

print(f"bcrypt version: {bcrypt.__version__}")
print(f"Has __about__: {hasattr(bcrypt, '__about__')}")

pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')

# Test normal password
test_pass = 'Owner@123'
print(f"\nTesting password: {test_pass}")
try:
    test_hash = pwd_ctx.hash(test_pass)
    print(f"Hash created: {test_hash[:30]}...")
    result = pwd_ctx.verify(test_pass, test_hash)
    print(f"Verify result: {result}")
except Exception as e:
    print(f"Error: {e}")

# Test long password (>72 bytes)
long_pass = 'a' * 80
print(f"\nTesting long password ({len(long_pass)} chars):")
try:
    test_hash = pwd_ctx.hash(long_pass)
    print(f"Hash created: {test_hash[:30]}...")
    result = pwd_ctx.verify(long_pass, test_hash)
    print(f"Verify result: {result}")
except Exception as e:
    print(f"Error: {e}")
