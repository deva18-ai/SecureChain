# 🚀 SecureChain Complete Demo Guide

## 📋 Prerequisites Checklist

Before starting the demo, ensure all services are running:

```bash
# 1. PostgreSQL Database
✅ Running on: localhost:5432

# 2. Hardhat Blockchain Node
✅ Running on: http://127.0.0.1:8545

# 3. Backend API
✅ Running on: http://localhost:8000

# 4. Frontend Application
✅ Running on: http://localhost:5173
```

---

## 🌱 Step 1: Seed Demo Data

### Run the Seed Script

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using one)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Run seed script
python seed_demo.py
```

### What Gets Created:

#### 👥 **7 Demo Users**

| Role | Name | Email | Password | Wallet Address |
|------|------|-------|----------|----------------|
| **ADMIN** | Admin Owner | admin@securechain.local | Admin@123 | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 |
| **MANAGER** | Sarah Manager | manager@securechain.local | Manager@123 | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 |
| **AUDITOR** | Alex Auditor | auditor@securechain.local | Auditor@123 | 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC |
| **USER** | Priya Sharma | priya@securechain.local | User@123 | 0x90F79bf6EB2c4f870365E785982E1f101E93b906 |
| **USER** | Rahul Kumar | rahul@securechain.local | User@123 | 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 |
| **USER** | Ananya Rao | ananya@securechain.local | User@123 | 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc |
| **USER** | Vikram Singh | vikram@securechain.local | User@123 | 0x976EA74026E726554dB657fA54763abd0C3a0aa9 |

#### 🔑 **7 Digital Identities (DIDs)**
- All users have verified DIDs
- DIDs follow format: `did:securechain:role:identifier`
- Each has unique identity hash

#### 📦 **6 Demo Assets**

| Asset ID | Name | Category | Assigned To | Status |
|----------|------|----------|-------------|--------|
| SC-LAPTOP-001 | Dell Latitude 5420 | Laptop | Priya Sharma | ACTIVE |
| SC-LAPTOP-002 | HP EliteBook 840 | Laptop | Rahul Kumar | ACTIVE |
| SC-MOBILE-001 | iPhone 14 Pro | Mobile | Ananya Rao | ACTIVE |
| SC-SERVER-001 | Dell PowerEdge R740 | Server | Vikram Singh | ACTIVE |
| SC-LAPTOP-003 | Lenovo ThinkPad X1 | Laptop | Unassigned | ACTIVE |
| SC-MOBILE-002 | Samsung Galaxy S23 | Mobile | Unassigned | ACTIVE |

---

## 🎯 Step 2: Complete Demo Workflow

### 🔐 Workflow 1: Owner Registration Flow

#### **Test New User Registration**

1. **Login as Owner**
   ```
   URL: http://localhost:5173/login
   Email: admin@securechain.local
   Password: Admin@123
   ```

2. **Register New User**
   - Navigate to: **Users** page
   - Click: **"Register User"** button
   - Fill form:
     ```
     Full Name: Test Employee
     Email: test@securechain.local
     Password: Test@123
     Role: Employee (USER)
     ```
   - Click: **"Register User"**
   - ✅ User appears in list immediately

3. **Verification**
   - New user row shows in table
   - Status badge shows: **ACTIVE**
   - Role badge shows: **Employee**
   - Can now login with test@securechain.local / Test@123

---

### 📦 Workflow 2: Asset Registration Flow

#### **Test New Asset Registration**

1. **Login as Owner** (if not already)
   ```
   Email: admin@securechain.local
   Password: Admin@123
   ```

2. **Register New Asset**
   - Navigate to: **Assets** page
   - Click: **"Register Asset"** button
   - Fill form:
     ```
     Asset ID: SC-TABLET-001
     Name: iPad Pro 12.9"
     Category: Tablet
     Metadata URI: ipfs://QmTablet001xyz
     Assigned User: Select "Priya Sharma"
     ```
   - Click: **"Register Asset"**
   - ✅ Asset card appears in grid

3. **Verification**
   - Asset shows with ACTIVE status
   - Assigned to Priya Sharma
   - Has blockchain transaction hash
   - VERIFIED badge displays

---

### 🔄 Workflow 3: Transfer Request Flow (Manager → Owner Approval)

This is the **MAIN DEMO WORKFLOW** showing the complete approval system!

#### **Part A: Manager Creates Transfer Request**

1. **Logout and Login as Manager**
   ```
   Email: manager@securechain.local
   Password: Manager@123
   ```

2. **Create Transfer Request**
   - Navigate to: **Assets** page
   - Click: **"Request Transfer"** button
   - Fill form:
     ```
     Asset: SC-LAPTOP-001 - Dell Latitude 5420
     Recipient: Rahul Kumar (USER) - 0x15d3...6A65
     ```
   - Click: **"Request Transfer"**
   - ✅ Toast: "Transfer request submitted for Owner approval"

3. **Verify Request Created**
   - Navigate to: **Requests** page
   - See your request with:
     - Status: **🟡 PENDING**
     - Workflow step 2: **PENDING OWNER** (blue, pulsing)
     - Message: "Awaiting Owner"

#### **Part B: Owner Approves Transfer**

4. **Logout and Login as Owner**
   ```
   Email: admin@securechain.local
   Password: Admin@123
   ```

5. **Review Pending Request**
   - Navigate to: **Requests** page
   - Statistics show:
     - **Pending: 1** (or more)
   - See request in table:
     - Request ID: #[number]
     - Requester: Sarah Manager
     - Operation: Asset Transfer
     - Target: Dell Latitude 5420
     - Status: **PENDING**
     - Workflow: Step 2 highlighted (blue, pulsing)

6. **Approve the Request**
   - Click: **"Approve"** button on the request row
   - ✅ Request status changes to **APPROVED**
   - ✅ Workflow progresses to step 3: **APPROVED** (green)
   - ✅ Then automatically to step 4: **EXECUTED** (green)
   - ✅ Toast: "Request approved and executed"

7. **Verify Transfer Completed**
   - Navigate to: **Assets** page
   - Find: **SC-LAPTOP-001**
   - Verify: Now assigned to **Rahul Kumar** (changed from Priya Sharma)
   - Has new blockchain transaction hash

#### **Part C: Manager Views Approved Request**

8. **Logout and Login as Manager**
   ```
   Email: manager@securechain.local
   Password: Manager@123
   ```

9. **Check Request Status**
   - Navigate to: **Requests** page
   - See your request with:
     - Status: **🟢 EXECUTED**
     - Workflow: All steps green (1-5)
     - Can click to view full details

---

### ❌ Workflow 4: Transfer Rejection Flow

#### **Test Owner Rejection with Reason**

1. **Login as Manager**
   ```
   Email: manager@securechain.local
   Password: Manager@123
   ```

2. **Create Another Transfer Request**
   - Navigate to: **Assets** page
   - Click: **"Request Transfer"**
   - Select:
     ```
     Asset: SC-MOBILE-001 - iPhone 14 Pro
     Recipient: Vikram Singh
     ```
   - Submit request

3. **Login as Owner**
   ```
   Email: admin@securechain.local
   Password: Admin@123
   ```

4. **Reject the Request**
   - Navigate to: **Requests** page
   - Find the new pending request
   - Click: **"Reject"** button
   - Modal opens with textarea
   - Enter rejection reason:
     ```
     This device is required for the current project.
     Transfer request cannot be approved at this time.
     Please submit again after project completion.
     ```
   - Click: **"Reject"** to confirm
   - ✅ Status changes to **🔴 REJECTED**

5. **Verify Rejection Recorded**
   - Request shows REJECTED status
   - Reason appears in "Reason" column
   - Workflow shows rejection at step 2
   - Asset ownership unchanged (still Ananya Rao)

---

### 👀 Workflow 5: User View (Cannot Transfer)

#### **Verify Security: Users Cannot Transfer Assets**

1. **Login as User (Asset Owner)**
   ```
   Email: priya@securechain.local
   Password: User@123
   ```

2. **View Dashboard**
   - See statistics relevant to user role
   - View assigned assets count
   - See recent activity

3. **Navigate to Assets**
   - Can view all assets
   - Can see own assigned assets highlighted
   - **NO "Request Transfer" button** (hidden for regular users)
   - Can click asset card to view details only

4. **Verification**
   - ✅ User can VIEW assets
   - ❌ User CANNOT request transfers
   - ❌ User CANNOT modify assets
   - This is enforced at:
     - Frontend (buttons hidden)
     - Backend API (role validation)
     - Smart Contract (transfer functions blocked)

---

### 📊 Workflow 6: Auditor Access

#### **Test Read-Only Audit Access**

1. **Login as Auditor**
   ```
   Email: auditor@securechain.local
   Password: Auditor@123
   ```

2. **Navigate to Requests Page**
   - Can VIEW all requests
   - Can see workflow progress
   - **NO approval/rejection buttons** (auditor is read-only)

3. **Navigate to Audit Logs**
   - View all system operations
   - See blockchain transaction hashes
   - Can verify operations
   - Filter by action type

4. **Navigate to Security Center**
   - View security events
   - See unauthorized attempt logs
   - Review security statistics
   - All in read-only mode

---

## 🧪 Advanced Testing Scenarios

### Scenario 1: Multiple Pending Requests

1. **As Manager:** Create 3 transfer requests
2. **As Owner:** Approve 1, Reject 1, Leave 1 pending
3. **Verify:** Statistics update correctly
4. **Verify:** Filters work (All, Pending, Approved, Rejected)

### Scenario 2: Transfer Chain

1. **Initial:** SC-LAPTOP-001 → Priya
2. **Request 1:** Transfer to Rahul (Approve)
3. **Request 2:** Transfer to Ananya (Approve)
4. **Request 3:** Transfer to Vikram (Approve)
5. **Verify:** Asset history shows complete chain
6. **Verify:** Each transfer has blockchain TX hash

### Scenario 3: Unassigned Asset Assignment

1. **As Owner:** Navigate to Assets
2. **As Owner:** Register new asset WITHOUT initial assignment
3. **As Manager:** Request transfer TO user from unassigned
4. **As Owner:** Approve
5. **Verify:** Asset now assigned to user

### Scenario 4: Dashboard Statistics

1. **Create multiple operations:**
   - 2 users registered
   - 3 assets registered
   - 5 transfer requests (3 approved, 2 rejected)
2. **Verify Dashboard shows:**
   - Total Users: Updated count
   - Total Assets: Updated count
   - Pending: Only pending requests
   - Approved: Approved count
   - Recent Activity: Last 5 operations

---

## 🔍 Verification Checklist

### ✅ User Registration
- [ ] Owner can register users
- [ ] All fields validate correctly
- [ ] User appears in list immediately
- [ ] Can login with new credentials
- [ ] Role badge displays correctly
- [ ] Wallet address stored

### ✅ Asset Registration
- [ ] Owner can register assets
- [ ] User dropdown populated
- [ ] Asset minted on blockchain
- [ ] Transaction hash recorded
- [ ] Asset card displays correctly
- [ ] Status badge shows ACTIVE
- [ ] VERIFIED badge appears

### ✅ Transfer Requests
- [ ] Manager can create requests
- [ ] Asset and user dropdowns work
- [ ] Validation prevents invalid submissions
- [ ] Request enters PENDING status
- [ ] Appears in requests list
- [ ] Workflow visualizer shows step 2

### ✅ Request Approval
- [ ] Owner sees all pending requests
- [ ] Statistics accurate
- [ ] Workflow progress displays correctly
- [ ] Approve button executes transfer
- [ ] Status updates to EXECUTED
- [ ] Asset ownership changes
- [ ] New blockchain TX created
- [ ] Toast notifications work

### ✅ Request Rejection
- [ ] Reject button opens modal
- [ ] Reason field required
- [ ] Status updates to REJECTED
- [ ] Reason stored and displayed
- [ ] Asset ownership unchanged
- [ ] Manager notified

### ✅ Dashboard
- [ ] Statistics load correctly
- [ ] Role-based filtering works
- [ ] Recent activity updates
- [ ] Charts display properly
- [ ] System status shows ONLINE
- [ ] Refresh button works

### ✅ Security
- [ ] Users cannot request transfers (UI hidden)
- [ ] Users cannot transfer assets (smart contract blocks)
- [ ] Auditors read-only access
- [ ] Managers await approval
- [ ] Only Owner can approve/reject

---

## 🐛 Troubleshooting

### Issue: Seed script fails

**Solution:**
```bash
# Ensure database is running
docker ps | grep postgres

# Ensure backend dependencies installed
pip install -r requirements.txt

# Check database connection
psql -U postgres -d securechain -h localhost -p 5432
```

### Issue: Cannot login after seeding

**Solution:**
- Ensure password is exactly as specified (case-sensitive)
- Clear browser cookies/cache
- Check backend logs: `docker logs -f securechain-backend`

### Issue: Transfer request doesn't execute

**Solution:**
- Verify blockchain node is running: `curl http://127.0.0.1:8545`
- Check recipient has wallet address
- Review backend logs for errors
- Ensure MetaMask not blocking

### Issue: Assets don't show blockchain hash

**Solution:**
- This is expected in demo mode
- Real blockchain minting happens when contract deployed
- Demo hashes are prefixed with `0xdemo...`

---

## 📞 Quick Reference

### Service URLs
```
Frontend:    http://localhost:5173
Backend API: http://localhost:8000
API Docs:    http://localhost:8000/docs
Health:      http://localhost:8000/health
Blockchain:  http://127.0.0.1:8545
Database:    localhost:5432
```

### Demo Accounts Quick Access
```
Owner:    admin@securechain.local     / Admin@123
Manager:  manager@securechain.local   / Manager@123
Auditor:  auditor@securechain.local   / Auditor@123
User 1:   priya@securechain.local     / User@123
User 2:   rahul@securechain.local     / User@123
User 3:   ananya@securechain.local    / User@123
User 4:   vikram@securechain.local    / User@123
```

### Clear Demo Data
```bash
cd backend
python seed_demo.py --clear
```

Then re-run without `--clear` to reseed fresh data.

---

## 🎉 Success Indicators

You'll know the demo is working perfectly when:

1. ✅ All 7 users can login
2. ✅ Assets page shows 6 demo assets
3. ✅ Manager can create transfer requests
4. ✅ Requests show PENDING status with workflow step 2 highlighted
5. ✅ Owner sees pending requests with statistics
6. ✅ Approve button executes transfer immediately
7. ✅ Asset ownership changes visible in Assets page
8. ✅ Reject modal requires reason and stores it
9. ✅ Dashboard shows accurate real-time statistics
10. ✅ Workflow visualizer animates through all 5 steps
11. ✅ Users cannot see transfer buttons
12. ✅ Auditors have read-only access
13. ✅ Toast notifications appear for all actions
14. ✅ Recent activity feed updates in real-time

---

**Ready to test! Follow the workflows in order for best results.** 🚀
