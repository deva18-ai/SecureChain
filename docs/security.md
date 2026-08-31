# SecureChain Security Architecture

## Security Overview

SecureChain implements a defense-in-depth security strategy across all layers: frontend, backend, database, and blockchain. This document outlines the security measures, threat model, and best practices.

---

## Threat Model

### Assets to Protect
1. **User Credentials** - Email, password hashes
2. **Private Keys** - Wallet private keys, deployer key
3. **JWT Secrets** - Token signing keys
4. **Audit Integrity** - Immutable audit trail
5. **Asset Ownership** - NFT ownership records
6. **Identity Data** - DIDs, identity hashes

### Threat Actors
- **External Attackers** - Unauthenticated, authenticated users
- **Malicious Insiders** - Compromised accounts, rogue admins
- **Supply Chain** - Compromised dependencies
- **Infrastructure** - Database, network, container escapes

### Attack Vectors
| Vector | Mitigation |
|--------|------------|
| SQL Injection | SQLAlchemy ORM, parameterized queries |
| XSS | React auto-escaping, CSP headers |
| CSRF | JWT in Authorization header (not cookies) |
| JWT Theft | Short expiry, secure storage, HTTPS |
| Privilege Escalation | Backend + frontend RBAC, contract modifiers |
| Reentrancy | OpenZeppelin ReentrancyGuard |
| Private Key Exposure | Env variables, never in code |
| Audit Tampering | Blockchain verification, append-only logs |

---

## Authentication Security

### Password Policy
- **Minimum Length**: 8 characters
- **Complexity**: Uppercase, lowercase, number, special character
- **Hashing**: bcrypt with cost factor 12
- **Storage**: Only hashed passwords in database

```python
# Backend implementation
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### JWT Token Security
- **Algorithm**: HS256 (symmetric) - RS256 recommended for production
- **Expiry**: 7 days (configurable)
- **Claims**: `sub` (user_id), `email`, `role`, `exp`
- **Storage**: localStorage (frontend), Authorization header
- **Rotation**: Refresh token pattern recommended for production

```python
# Token creation
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
```

### Session Management
- Stateless JWT (no server-side sessions)
- Token invalidation on logout (client-side only)
- For production: Implement token blacklist/redis for immediate revocation

---

## Authorization Security

### Backend RBAC
```python
# Role-based dependency injection
def require_role(*allowed_roles: UserRole):
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(403, f"Requires one of: {[r.value for r in allowed_roles]}")
        return current_user
    return role_checker

require_admin = require_role(UserRole.ADMIN)
require_manager = require_role(UserRole.ADMIN, UserRole.MANAGER)
require_auditor = require_role(UserRole.ADMIN, UserRole.AUDITOR)
```

### Frontend Route Guards
```typescript
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !hasRole(allowedRoles)) return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
}
```

### Smart Contract Access Control
```solidity
// Role-based modifiers
modifier onlyAdmin() {
    require(hasRole(ADMIN_ROLE, msg.sender), "SecureChain: caller is not admin");
    _;
}

modifier onlyAuthorizedForAsset(uint256 tokenId) {
    require(
        ownerOf(tokenId) == msg.sender || 
        hasRole(MANAGER_ROLE, msg.sender) || 
        hasRole(ADMIN_ROLE, msg.sender),
        "SecureChain: not authorized for this asset"
    );
    _;
}
```

---

## Data Protection

### On-Chain Data
**Stored on Blockchain:**
- DID identifiers and wallet mappings
- Identity verification status
- NFT ownership (tokenId → owner)
- Role assignments
- Event emissions for audit trail

**NOT Stored on Blockchain:**
- Passwords or password hashes
- Private keys
- Email addresses
- Personal identifiable information (PII)
- Full asset metadata (only URI stored)
- Audit log details (only hashes/references)

### Off-Chain Data (PostgreSQL)
**Encrypted/Secured:**
- Password hashes (bcrypt)
- JWT secret (environment variable)
- Database credentials (environment variable)
- Blockchain private key (environment variable)

**Access Control:**
- Database user with minimal privileges
- Connection pooling with authentication
- SSL/TLS for database connections (production)

### Data Retention
- Audit logs: Configurable (default 365 days)
- User data: Retained while account active
- Blockchain transactions: Permanent (immutable)
- Soft deletes for users (is_active flag)

---

## Network Security

### CORS Configuration
```python
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000", 
    "http://127.0.0.1:5173"
    # Production: specific domains only
]
```

### HTTPS Enforcement (Production)
- TLS 1.3 minimum
- HSTS headers
- Secure cookies (if used)
- Certificate pinning for API clients

### Rate Limiting
```python
# Recommended production implementation
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/v1/users")
@limiter.limit("100/minute")
async def list_users(request: Request, ...):
    ...
```

### Security Headers
```python
# Recommended middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    return response
```

---

## Blockchain Security

### Smart Contract Best Practices

#### 1. Use Established Libraries
```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
```

#### 2. Checks-Effects-Interactions Pattern
```solidity
function transferAsset(uint256 tokenId, address to) external onlyAuthorizedForAsset(tokenId) {
    // CHECKS
    require(to != address(0), "Invalid recipient");
    require(_exists(tokenId), "Asset does not exist");
    require(assets[tokenId].status != 2, "Asset is burned");
    
    // EFFECTS (state changes)
    address from = assets[tokenId].currentOwner;
    _safeTransfer(from, to, tokenId, "");
    assets[tokenId].currentOwner = to;
    assets[tokenId].status = 1;
    
    // INTERACTIONS (external calls - none in this case)
    emit AssetTransferred(tokenId, from, to, block.timestamp, "");
}
```

#### 3. Input Validation
```solidity
function createIdentity(string calldata did, address wallet, bytes32 identityHash) external onlyAdmin {
    require(bytes(did).length > 0, "DID cannot be empty");
    require(wallet != address(0), "Wallet cannot be zero address");
    require(!didExists[did], "DID already exists");
    require(identityHash != bytes32(0), "Identity hash cannot be zero");
    ...
}
```

#### 4. Safe Transfers
```solidity
// Uses OpenZeppelin's _safeTransfer which checks for ERC721Receiver
_safeTransfer(from, to, tokenId, "");
```

#### 5. Event Emission for Audit Trail
```solidity
// Every state-changing function emits events
emit AssetMinted(tokenId, assetId, creator, owner, name, block.timestamp, "");
emit AuditRecorded(auditId, actor, action, resourceType, resourceId, role, "", block.number, block.timestamp);
```

### Private Key Management

#### Development
```bash
# .env (never commit)
PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEPLOYER_PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Production
- **Hardware Security Module (HSM)** for key storage
- **Multi-signature** for admin operations
- **Key rotation** policy
- **Secret manager** (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault)

### RPC Security
- **Local Development**: Hardhat node (no auth needed)
- **Testnet/Mainnet**: Authenticated RPC (Infura, Alchemy, QuickNode)
- **Rate Limiting**: Configure on RPC provider
- **Monitoring**: Alert on unusual activity

---

## Audit Trail Security

### Tamper-Evident Design
1. **Database**: Append-only audit_logs table
2. **Blockchain**: Every critical action emits event
3. **Verification**: Auditor can verify any log against blockchain
4. **Hash Chain**: Each log references previous (future enhancement)

### Blockchain Verification Process
```python
async def verify_on_blockchain(db: AsyncSession, tx_hash: str) -> bool:
    receipt = await blockchain_service.get_transaction_receipt(tx_hash)
    if not receipt or receipt.status != 1:
        return False
    
    # Update audit log verification status
    log = await db.execute(select(AuditLog).where(AuditLog.blockchain_tx_hash == tx_hash))
    if log:
        log.blockchain_verified = True
        log.blockchain_block_number = receipt.blockNumber
        await db.commit()
    return True
```

### Auditor Interface
- Read-only access to audit logs
- Blockchain verification by:
  - Transaction hash
  - Asset token ID
  - DID identifier
- Clear VERIFIED/FAILED status display

---

## Dependency Security

### Python (Backend)
```bash
# Check for vulnerabilities
pip install safety
safety check -r requirements.txt

# Update dependencies
pip list --outdated
pip install --upgrade package_name
```

### Node.js (Frontend/Blockchain)
```bash
# Audit dependencies
npm audit
npm audit fix

# Check outdated
npm outdated
```

### Automated Scanning (CI/CD)
```yaml
# GitHub Actions example
- name: Run security audit
  run: |
    npm audit --audit-level=high
    safety check -r requirements.txt
```

---

## Container Security (Docker)

### Dockerfile Best Practices
```dockerfile
# Use non-root user
FROM python:3.11-slim
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

# Minimal base image
# No unnecessary packages
# Read-only filesystem where possible
```

### Docker Compose Security
```yaml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

---

## Incident Response

### Security Incident Types
1. **Credential Compromise** - Rotate JWT secret, force re-login
2. **Private Key Exposure** - Revoke deployer key, redeploy contract
3. **Database Breach** - Rotate DB credentials, audit access logs
4. **Smart Contract Vulnerability** - Emergency pause, upgrade if possible

### Response Procedures
1. **Detect** - Monitoring alerts, user reports
2. **Contain** - Disable affected endpoints, revoke tokens
3. **Investigate** - Log analysis, blockchain forensics
4. **Remediate** - Patch vulnerability, rotate secrets
5. **Recover** - Restore service, verify integrity
6. **Post-Mortem** - Document, improve defenses

---

## Compliance Considerations

### Data Privacy (GDPR/CCPA)
- **Right to Access**: `/auth/me` endpoint
- **Right to Rectification**: `PATCH /users/{id}`
- **Right to Erasure**: `DELETE /users/{id}` (soft delete)
- **Data Portability**: Export user data endpoint
- **Privacy by Design**: Minimal data collection, no PII on-chain

### Audit Requirements
- Immutable audit trail for all critical operations
- Blockchain verification for tamper evidence
- Role-based access to audit logs
- Retention policies configurable

### Financial Regulations (if applicable)
- KYC/AML integration points
- Transaction monitoring
- Suspicious activity reporting

---

## Security Checklist

### Pre-Deployment
- [ ] All `.env` files use strong, unique secrets
- [ ] JWT secret is 256-bit random string
- [ ] Database passwords are strong
- [ ] Blockchain private keys are from hardware wallet/HSM
- [ ] HTTPS enabled with valid certificates
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting configured
- [ ] Security headers implemented
- [ ] Dependency vulnerability scan passed
- [ ] Smart contract audit completed (if mainnet)
- [ ] Penetration testing performed
- [ ] Backup and recovery procedures tested

### Post-Deployment
- [ ] Monitoring and alerting configured
- [ ] Log aggregation and analysis
- [ ] Incident response plan documented
- [ ] Regular security updates scheduled
- [ ] Access reviews quarterly
- [ ] Penetration testing annually
- [ ] Smart contract bug bounty (if mainnet)

---

## Secure Development Practices

### Code Review Requirements
- All PRs require review
- Security-focused review for auth/crypto changes
- No secrets in code (use pre-commit hooks)
- Static analysis in CI (bandit, semgrep, eslint-security)

### Secret Detection
```bash
# Pre-commit hook
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.63.0
    hooks:
      - id: trufflehog
```

### Security Training
- OWASP Top 10 awareness
- Smart contract security patterns
- Secure coding practices
- Incident response drills

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Smart Contract Top 10](https://owasp.org/www-project-smart-contract-top-10/)
- [OpenZeppelin Security Best Practices](https://docs.openzeppelin.com/learn/security-best-practices)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Ethereum Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)