# SecureChain - Complete Workflow Guide

## 📋 Table of Contents
1. [User Registration](#user-registration)
2. [Asset Registration](#asset-registration)
3. [Asset Transfer Requests](#asset-transfer-requests)
4. [Request Approval Center](#request-approval-center)
5. [Dashboard Overview](#dashboard-overview)
6. [Role-Based Access](#role-based-access)

---

## 🔐 Role-Based Access

### Owner (ADMIN)
- **Full system access**
- Register new users
- Register and mint assets
- Approve/reject all requests
- Manage roles
- View all audit trails

### Manager
- Request asset transfers
- View assets and users
- Submit protected operation requests
- Track request status
- **Cannot execute without Owner approval**

### Auditor
- Read-only access to audit logs
- Verify blockchain transactions
- Review security events
- **Cannot modify any data**

### User (Employee)
- View assigned assets
- View own activity
- **Cannot transfer assigned assets** (enforced at smart contract level)
- View own digital identity

---

## 👥 User Registration

### Location: `/users`

### Who Can Register Users?
- **Only ADMIN (Owner)** can register new users

### Registration Steps:

1. **Navigate to Users Page**
   - Click "Users" in sidebar
   - Click "Register User" button (top right)

2. **Fill Registration Form**
   ```
   Full Name: Enter user's complete name (e.g., "Ananya Rao")
   Email: User's email (e.g., "ananya@securechain.local")
   Temporary Password: Set initial password
   Role: Select from:
     - Employee (USER) - Basic access
     - Manager (MANAGER) - Can request operations
     - Auditor (AUDITOR) - Read-only audit access
   ```

3. **Submit Registration**
   - Click "Register User"
   - User appears in user list immediately
   - User can now login with provided credentials

4. **Verification**
   - New user appears in table with:
     - ✅ ACTIVE status badge
     - Assigned role badge
     - Created timestamp
     - No DID/Wallet initially (created later)

### What Happens After Registration?

```
1. User Account Created ✅
   ↓
2. User Can Login ✅
   ↓
3. Admin Creates DID for User (in Identities page) ✅
   ↓
4. User Links Wallet Address ✅
   ↓
5. User Ready for Asset Assignment ✅
```

---

## 📦 Asset Registration

### Location: `/assets`

### Who Can Register Assets?
- **Only ADMIN (Owner)** can register assets

### Registration Steps:

1. **Navigate to Assets Page**
   - Click "Assets" in sidebar
   - Click "Register Asset" button (top right)

2. **Fill Asset Registration Form**
   ```
   Asset ID: Unique identifier (e.g., "SC-LAPTOP-001")
   Name: Asset name (e.g., "Dell Latitude 5420")
   Category: Asset type (e.g., "Laptop", "Server", "Mobile")
   Metadata URI: IPFS or internal URI (e.g., "ipfs://Qm...")
   Assigned User: Select from dropdown (user must have wallet address)
   ```

3. **Submit Registration**
   - Click "Register Asset"
   - Asset is minted on blockchain
   - ERC-721 NFT created
   - Initial assignment recorded

4. **Verification**
   - Asset appears with:
     - ✅ ACTIVE status
     - Blockchain transaction hash
     - Assigned user
     - VERIFIED badge

### Asset Lifecycle

```
1. ADMIN Registers Asset ✅
   ↓
2. Asset Minted on Blockchain (ERC-721) ✅
   ↓
3. Initially Assigned to Selected User ✅
   ↓
4. User CANNOT Transfer (Smart Contract Enforcement) ✅
   ↓
5. Only ADMIN/MANAGER Can Request Reassignment ✅
```

### Important Security Note ⚠️

**Users CANNOT transfer assets assigned to them!**

This is enforced at the **smart contract level**:
- Contract retains ERC-721 ownership (custodian model)
- All `transferFrom`, `safeTransferFrom`, `approve`, `setApprovalForAll` functions are **blocked**
- Security alerts emitted on unauthorized attempts

---

## 🔄 Asset Transfer Requests

### Location: `/assets` or `/requests`

### Who Can Request Transfers?
- **MANAGER** can request asset transfers
- **ADMIN** can directly approve/execute

### Transfer Request Process (For Managers):

1. **Initiate Transfer Request**
   - **From Assets Page:**
     - Click "Request Transfer" button
   - **Or from Requests Page:**
     - Click "New Request"
     - Select "Asset Transfer"

2. **Fill Transfer Request Form**
   ```
   Asset: Select from dropdown (shows Asset ID and Name)
   Recipient: Select target user
     - Must have wallet address
     - Shows role in dropdown
   ```

3. **Submit Request**
   - Click "Request Transfer"
   - Request enters **PENDING** status
   - Awaits Owner approval

4. **Track Request Status**
   - View in Requests page
   - Status badges:
     - 🟡 PENDING - Awaiting Owner decision
     - 🟢 APPROVED - Owner approved, executed
     - 🟢 EXECUTED - Successfully completed
     - 🔴 REJECTED - Owner rejected with reason

### Workflow Visualization

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌────────────┐
│  REQUESTED  │ → │ PENDING OWNER│ → │  APPROVED   │ → │  EXECUTED    │ → │  ON-CHAIN  │
│  Manager    │    │  Awaiting    │    │  Owner      │    │  Action      │    │  Recorded  │
│  submits    │    │  decision    │    │  approves   │    │  performed   │    │  Blockchain│
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘    └────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  REJECTED   │
                                       │  Owner      │
                                       │  rejects    │
                                       └─────────────┘
```

---

## ✅ Request Approval Center

### Location: `/requests`

### Who Can Approve?
- **Only ADMIN (Owner)** can approve/reject requests

### Owner Dashboard Features:

1. **Statistics Overview**
   ```
   📊 Total Requests: All submitted requests
   ⏳ Pending: Awaiting your decision
   ✅ Approved: Successfully executed
   ❌ Rejected: Denied requests
   ```

2. **Approval Workflow Banner**
   ```
   MANAGER requests → PENDING → OWNER decides → APPROVED → EXECUTED
                                       ↓
                                   REJECTED
   ```

3. **Request List Table**
   
   **Columns:**
   - **Request ID**: Unique identifier (#1, #2, etc.)
   - **Requester**: Manager who submitted
   - **Role**: Manager badge
   - **Operation**: Asset Transfer, Asset Freeze, etc.
   - **Target**: Asset name
   - **Reason**: Transfer justification (if rejected)
   - **Created**: Submission timestamp
   - **Status**: Current state (PENDING/APPROVED/REJECTED)
   - **Workflow**: Visual progress indicator
   - **Actions**: Approve/Reject buttons

4. **Workflow Progress Indicator**
   ```
   1️⃣ REQUESTED → 2️⃣ PENDING OWNER → 3️⃣ APPROVED → 4️⃣ EXECUTED → 5️⃣ ON-CHAIN
   ```
   - ✅ Green: Completed
   - 🔵 Blue (pulsing): Current step
   - ⚪ Gray: Pending

### Approval Process:

1. **Review Pending Request**
   - Check requester identity
   - Verify asset details
   - Review recipient information

2. **Make Decision**
   
   **To Approve:**
   - Click "Approve" button
   - Request status changes to APPROVED
   - Asset transfer executes immediately
   - Blockchain transaction recorded
   - Both users notified

   **To Reject:**
   - Click "Reject" button
   - Modal opens for rejection reason
   - Enter detailed explanation (required)
   - Click "Reject" to confirm
   - Requester receives notification with reason

3. **Verification**
   - Check blockchain transaction hash
   - Verify asset reassignment
   - Review audit trail

### Filter Options:

```
- All: View all requests
- PENDING: Only awaiting approval
- APPROVED: Successfully executed
- COMPLETED: Same as approved
- REJECTED: Denied requests
```

---

## 📊 Dashboard Overview

### Location: `/dashboard`

### Available to All Roles

### Dashboard Components:

1. **Welcome Header**
   ```
   Welcome, [User Name]
   [Role] - SecureChain Control Center
   ```

2. **System Status**
   ```
   🟢 SYSTEM ONLINE (animated pulse)
   🔄 Refresh button
   ```

3. **Statistics Cards** (6 cards)
   ```
   👥 Total Users
   📦 Total Assets
   📄 Pending Approvals (for Owners)
   ✅ Approved Requests
   🔒 Security Events
   ⛓️ Blockchain Records
   ```

4. **Assets by Category** (Bar Chart)
   - Visual breakdown by category
   - Hover to see counts
   - Categories: Laptop, Server, Mobile, etc.

5. **Recent Activity Feed**
   - Last 5 operations
   - Includes:
     - User actions
     - Asset registrations
     - Transfers
     - Approvals/rejections
   - Real-time updates

### Role-Specific Views:

**Owner (ADMIN):**
- Sees all statistics
- Pending Approvals highlighted
- Full activity feed
- Can click stats to navigate

**Manager:**
- Sees relevant statistics
- "Pending Approvals" shows own submitted requests
- Activity filtered to own operations

**User:**
- Sees assigned assets count
- Own activity only
- Security events affecting them

**Auditor:**
- Read-only statistics
- Full activity feed
- Security events
- Blockchain verification links

---

## 🔄 Complete End-to-End Workflow

### Scenario: Assigning Laptop to New Employee

```
Step 1: REGISTER USER (Owner)
=================================
Owner → Users Page → Register User
  ├─ Full Name: "Priya Sharma"
  ├─ Email: "priya@securechain.local"
  ├─ Password: "TempPass@123"
  └─ Role: "Employee (USER)"
Result: ✅ User created, can login

Step 2: CREATE DIGITAL IDENTITY (Owner)
=================================
Owner → Identities Page → Create DID
  ├─ User: "Priya Sharma"
  ├─ Wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  └─ DID: Auto-generated did:securechain:...
Result: ✅ Identity on blockchain, wallet linked

Step 3: REGISTER ASSET (Owner)
=================================
Owner → Assets Page → Register Asset
  ├─ Asset ID: "SC-LAPTOP-042"
  ├─ Name: "Dell Latitude 5420"
  ├─ Category: "Laptop"
  ├─ Metadata URI: "ipfs://Qm...abc123"
  └─ Assigned User: "Priya Sharma"
Result: ✅ Asset minted, assigned to Priya

Step 4: USER VERIFICATION (Priya)
=================================
Priya → Login → Dashboard
  ├─ View assigned asset
  ├─ See "SC-LAPTOP-042"
  └─ CANNOT transfer (button disabled/hidden)
Result: ✅ User can view, CANNOT transfer

Step 5: TRANSFER REQUEST (Manager - Later)
=================================
Manager → Assets → Request Transfer
  ├─ Asset: "SC-LAPTOP-042"
  └─ New Recipient: "Rahul Kumar"
Result: 🟡 Request PENDING Owner approval

Step 6: OWNER APPROVAL
=================================
Owner → Requests Page → View Pending
  ├─ Review: "SC-LAPTOP-042" transfer
  ├─ From: "Priya Sharma"
  ├─ To: "Rahul Kumar"
  ├─ Decision: APPROVE
  └─ Click "Approve"
Result: ✅ Transfer EXECUTED, Rahul owns laptop now

Step 7: AUDIT VERIFICATION (Auditor)
=================================
Auditor → Audit Logs → Search transfer
  ├─ Find blockchain TX hash
  ├─ Verify on blockchain explorer
  └─ Confirm immutable record
Result: ✅ Transfer verified on-chain
```

---

## 🛡️ Security Enforcement

### Non-Transferable Asset Assignment

**Problem:** Users could transfer company assets if they had ERC-721 ownership

**Solution:** Custodian Model + Smart Contract Enforcement

```solidity
// In Smart Contract (SecureChain.sol)

// ❌ BLOCKED for assigned users:
function transferFrom(address from, address to, uint256 tokenId) public override {
    // Check if user is just assigned (not true owner)
    if (msg.sender != custodian && msg.sender != owner()) {
        emit SecurityAlert(..., "Unauthorized transfer attempt");
        revert("Assets cannot be transferred by assigned users");
    }
    super.transferFrom(from, to, tokenId);
}

// ❌ BLOCKED for assigned users:
function approve(address to, uint256 tokenId) public override {
    if (msg.sender != custodian && msg.sender != owner()) {
        emit SecurityAlert(..., "Unauthorized approve attempt");
        revert("Assigned users cannot approve transfers");
    }
    super.approve(to, tokenId);
}

// ✅ ONLY ADMIN/MANAGER can reassign:
function assignAsset(uint256 tokenId, address to) public onlyRole(MANAGER_ROLE) {
    _assignAsset(tokenId, to);
    emit AssetAssigned(tokenId, getAssetAssignee(tokenId), to, msg.sender, block.timestamp);
}
```

### Security Event Logging

All unauthorized attempts are logged:
```
Event Type: UNAUTHORIZED_TRANSFER_ATTEMPT
Actor: User wallet address
Resource: Asset Token ID
Timestamp: Block timestamp
Alert Level: CRITICAL
```

Admins and Auditors can view these in `/security` page.

---

## 📋 Checklist: Is Everything Working?

### ✅ User Registration
- [ ] Owner can register users
- [ ] All required fields validated
- [ ] User appears in user list
- [ ] User can login immediately
- [ ] Role badge displays correctly
- [ ] Status shows ACTIVE

### ✅ Asset Registration
- [ ] Owner can register assets
- [ ] All fields validated
- [ ] User dropdown shows only users with wallets
- [ ] Asset minted on blockchain
- [ ] Transaction hash appears
- [ ] Asset shows in grid with correct status
- [ ] VERIFIED badge displays

### ✅ Transfer Requests
- [ ] Manager can create transfer requests
- [ ] Asset dropdown populated
- [ ] User dropdown shows wallet addresses
- [ ] Request validation works
- [ ] Request appears in requests list
- [ ] Status shows PENDING

### ✅ Request Approval
- [ ] Owner sees pending requests
- [ ] Workflow visualizer shows current step
- [ ] Approve button works
- [ ] Request status updates to APPROVED
- [ ] Asset ownership changes
- [ ] Blockchain transaction created
- [ ] Reject button opens modal
- [ ] Rejection reason required
- [ ] Rejected status with reason stored

### ✅ Dashboard
- [ ] Statistics load correctly
- [ ] Recent activity populates
- [ ] Asset category chart displays
- [ ] Role-based data filtering works
- [ ] System status shows ONLINE
- [ ] Refresh button updates data

### ✅ Security
- [ ] Users CANNOT transfer assigned assets
- [ ] Direct blockchain calls blocked
- [ ] Security events logged
- [ ] Alerts visible to Admin
- [ ] Audit trail immutable

---

## 🆘 Troubleshooting

### Issue: "User does not have a wallet address"
**Solution:** Create DID for user first in Identities page

### Issue: "Failed to register asset"
**Solution:** Ensure:
- Blockchain node is running
- MetaMask connected
- User has wallet address
- Gas available

### Issue: "Request stuck in PENDING"
**Solution:** Owner must approve/reject in Requests page

### Issue: "Transfer fails even after approval"
**Solution:** Check:
- Recipient has wallet address
- Recipient wallet is valid Ethereum address
- Blockchain node is responsive

### Issue: "Cannot create user"
**Solution:** Verify:
- You are logged in as ADMIN
- All form fields filled
- Email not already registered
- Password meets requirements

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify blockchain node is running: `http://localhost:8545`
3. Check backend API: `http://localhost:8000/health`
4. Review audit logs for transaction details
5. Check MetaMask connection

---

**Built with ❤️ for SIH26125 - Smart India Hackathon 2026**
