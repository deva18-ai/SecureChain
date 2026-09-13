# ✅ SecureChain Manual Testing Checklist

## 🎯 Complete Demo Verification Guide

Use this checklist to manually verify every feature works perfectly.

---

## 📋 PRE-TESTING CHECKLIST

### Services Running
- [ ] PostgreSQL running on port 5432
- [ ] Hardhat node running on port 8545
- [ ] Backend API running on port 8000
- [ ] Frontend running on port 5173

### Demo Data Seeded
- [ ] Ran `python seed_demo.py` successfully
- [ ] Saw success message with 7 users created
- [ ] Saw 6 assets created
- [ ] No errors in seed script output

### Browser Ready
- [ ] Open browser (Chrome/Firefox recommended)
- [ ] Navigate to http://localhost:5173
- [ ] Clear browser cache/cookies (Ctrl+Shift+Delete)
- [ ] Open browser console (F12) for debugging

---

## TEST 1: USER AUTHENTICATION (5 minutes)

### 1.1 Owner Login
- [ ] Go to http://localhost:5173/login
- [ ] Enter: admin@securechain.local
- [ ] Enter: Admin@123
- [ ] Click "Sign In"
- [ ] ✅ Redirects to /dashboard
- [ ] ✅ Shows "Welcome, Admin Owner"
- [ ] ✅ Shows "ADMIN - SecureChain Control Center"
- [ ] ✅ System status shows "SYSTEM ONLINE" (green pulse)

### 1.2 Manager Login
- [ ] Logout from Owner account
- [ ] Login with: manager@securechain.local / Manager@123
- [ ] ✅ Redirects to dashboard
- [ ] ✅ Shows "Welcome, Sarah Manager"
- [ ] ✅ Shows "MANAGER - SecureChain Control Center"

### 1.3 Auditor Login
- [ ] Logout
- [ ] Login with: auditor@securechain.local / Auditor@123
- [ ] ✅ Redirects to dashboard
- [ ] ✅ Shows "Welcome, Alex Auditor"
- [ ] ✅ Shows "AUDITOR - SecureChain Control Center"

### 1.4 User Login
- [ ] Logout
- [ ] Login with: priya@securechain.local / User@123
- [ ] ✅ Redirects to dashboard
- [ ] ✅ Shows "Welcome, Priya Sharma"
- [ ] ✅ Shows "USER - SecureChain Control Center"

### 1.5 Invalid Login
- [ ] Try login with: test@test.com / wrong123
- [ ] ✅ Shows error toast
- [ ] ✅ Stays on login page
- [ ] ✅ Form doesn't clear

---

## TEST 2: DASHBOARD (5 minutes)

### 2.1 Statistics Display (as Owner)
- [ ] Login as: admin@securechain.local / Admin@123
- [ ] Navigate to Dashboard
- [ ] ✅ "Total Users" card shows count > 0
- [ ] ✅ "Total Assets" card shows count > 0
- [ ] ✅ "Pending Approvals" card shows number
- [ ] ✅ "Approved Requests" card shows number
- [ ] ✅ "Security Events" card shows number
- [ ] ✅ "Blockchain Records" card shows number

### 2.2 Recent Activity
- [ ] ✅ "Recent Activity" section visible
- [ ] ✅ Shows list of activities (if any)
- [ ] ✅ Each activity has icon, description, timestamp

### 2.3 Assets by Category Chart
- [ ] ✅ "Assets by Category" chart displays
- [ ] ✅ Shows bars for different categories
- [ ] ✅ Bar heights match asset counts

### 2.4 Refresh Button
- [ ] Click refresh button (top right)
- [ ] ✅ Loading indicator appears briefly
- [ ] ✅ Data refreshes
- [ ] ✅ No errors in console

---

## TEST 3: USER MANAGEMENT (10 minutes)

### 3.1 View Users List (as Owner)
- [ ] Login as Owner
- [ ] Click "Users" in sidebar
- [ ] ✅ Users page loads
- [ ] ✅ Shows table with 7 demo users
- [ ] ✅ Columns: User, Email, Role, Status, DID, Wallet, Created, Actions
- [ ] ✅ Each user has avatar with initials
- [ ] ✅ Role badges show colors (Owner=violet, Manager=blue, etc.)
- [ ] ✅ Status badges show "ACTIVE" (green)

### 3.2 Search Users
- [ ] Type "Priya" in search box
- [ ] ✅ List filters to show only Priya
- [ ] Clear search
- [ ] ✅ All users visible again

### 3.3 Filter by Role
- [ ] Select "Employee (USER)" in role dropdown
- [ ] ✅ Shows only USER role users (4 users)
- [ ] Select "Manager" in dropdown
- [ ] ✅ Shows only Sarah Manager
- [ ] Select "All Roles"
- [ ] ✅ Shows all users again

### 3.4 Register New User
- [ ] Click "Register User" button (top right)
- [ ] ✅ Modal opens with form
- [ ] Fill form:
  - Full Name: "Demo Test User"
  - Email: "demotest@securechain.local"
  - Password: "Test@123"
  - Role: "Employee"
- [ ] Click "Register User"
- [ ] ✅ Toast shows "User registered successfully"
- [ ] ✅ Modal closes
- [ ] ✅ New user appears in table
- [ ] ✅ User row shows ACTIVE status
- [ ] ✅ Role badge shows "Employee"

### 3.5 View User Details
- [ ] Click three-dot menu on any user
- [ ] ✅ Details modal opens
- [ ] ✅ Shows user avatar
- [ ] ✅ Shows full name
- [ ] ✅ Shows role badge
- [ ] ✅ Shows email
- [ ] ✅ Shows DID (or "-" if none)
- [ ] ✅ Shows wallet address
- [ ] ✅ Shows created date
- [ ] Click "Close"
- [ ] ✅ Modal closes

### 3.6 User Permissions (as Manager - should not see page)
- [ ] Logout
- [ ] Login as Manager
- [ ] Try to access Users page
- [ ] ✅ Either redirected or shows "Access Restricted" message

---

## TEST 4: ASSET MANAGEMENT (10 minutes)

### 4.1 View Assets (as Owner)
- [ ] Login as Owner
- [ ] Click "Assets" in sidebar
- [ ] ✅ Assets page loads
- [ ] ✅ Statistics show:
  - Total Assets
  - Assigned
  - Available
  - Frozen
- [ ] ✅ Asset grid shows 6 demo assets
- [ ] ✅ Each card shows:
  - Asset ID (e.g., SC-LAPTOP-001)
  - Asset name
  - Category
  - Assigned user (or "Unassigned")
  - Status badge
  - VERIFIED badge
  - Blockchain hash

### 4.2 Search Assets
- [ ] Type "Laptop" in search box
- [ ] ✅ Shows only laptop assets
- [ ] Clear search
- [ ] ✅ All assets visible

### 4.3 Filter by Status
- [ ] Select "Active" in status dropdown
- [ ] ✅ Shows only ACTIVE assets
- [ ] Select "All Status"
- [ ] ✅ All assets visible

### 4.4 Register New Asset
- [ ] Click "Register Asset" button
- [ ] ✅ Modal opens with form
- [ ] Fill form:
  - Asset ID: "SC-DEMO-TEST-001"
  - Name: "Demo Test Laptop"
  - Category: "Laptop"
  - Metadata URI: "ipfs://QmDemoTest123"
  - Assigned User: Select "Priya Sharma"
- [ ] Click "Register Asset"
- [ ] ✅ Toast shows "Asset registered successfully"
- [ ] ✅ Modal closes
- [ ] ✅ New asset appears in grid
- [ ] ✅ Shows ACTIVE status
- [ ] ✅ Shows VERIFIED badge
- [ ] ✅ Shows assigned to Priya Sharma

### 4.5 View Asset Details
- [ ] Click any asset card
- [ ] ✅ Details modal opens
- [ ] ✅ Shows asset name
- [ ] ✅ Shows asset ID
- [ ] ✅ Shows status badge
- [ ] ✅ Shows category
- [ ] ✅ Shows assigned user
- [ ] ✅ Shows VERIFIED badge
- [ ] ✅ Shows created date
- [ ] ✅ Shows blockchain hash
- [ ] Click "Close"
- [ ] ✅ Modal closes

### 4.6 Manager Warning Notice
- [ ] Logout
- [ ] Login as Manager
- [ ] Go to Assets page
- [ ] ✅ Yellow warning box at top
- [ ] ✅ Says "Manager operations enter Pending Owner Approval"
- [ ] ✅ Shows request badges (Request Transfer, etc.)

---

## TEST 5: TRANSFER REQUEST WORKFLOW (15 minutes)

### Part A: Manager Creates Request

#### 5.1 Create Transfer Request
- [ ] Login as: manager@securechain.local / Manager@123
- [ ] Go to Assets page
- [ ] Click "Request Transfer" button (top right)
- [ ] ✅ Modal opens with form
- [ ] ✅ Asset dropdown populated with assets
- [ ] ✅ Recipient dropdown populated with users
- [ ] Select:
  - Asset: "SC-LAPTOP-001 - Dell Latitude 5420"
  - Recipient: "Rahul Kumar (USER) - 0x15d3...6A65"
- [ ] Click "Request Transfer"
- [ ] ✅ Toast shows "Transfer request submitted for Owner approval"
- [ ] ✅ Modal closes

#### 5.2 View Request Status (Manager View)
- [ ] Click "Requests" in sidebar
- [ ] ✅ Requests page loads
- [ ] ✅ Statistics show counts
- [ ] ✅ Approval workflow banner at top
- [ ] ✅ Your request appears in table
- [ ] ✅ Request ID shows (e.g., #1)
- [ ] ✅ Requester shows "Sarah Manager"
- [ ] ✅ Role badge shows "MANAGER"
- [ ] ✅ Operation shows "Asset Transfer"
- [ ] ✅ Target shows "Dell Latitude 5420"
- [ ] ✅ Status badge shows "🟡 PENDING" (yellow/amber)
- [ ] ✅ Workflow visualizer shows 5 steps
- [ ] ✅ Step 1 "REQUESTED" is green (completed)
- [ ] ✅ Step 2 "PENDING OWNER" is blue and pulsing (current)
- [ ] ✅ Steps 3-5 are gray (pending)
- [ ] ✅ Actions column shows "Awaiting Owner"

### Part B: Owner Reviews Request

#### 5.3 Owner Views Pending Requests
- [ ] Logout
- [ ] Login as: admin@securechain.local / Admin@123
- [ ] Click "Requests" in sidebar
- [ ] ✅ Requests page loads
- [ ] ✅ Statistics section shows:
  - Total Requests: [number]
  - Pending: 1 (or more)
  - Approved: [number]
  - Rejected: [number]
- [ ] ✅ Request appears in table
- [ ] ✅ Requester shows "Sarah Manager"
- [ ] ✅ Status shows "PENDING"
- [ ] ✅ Workflow step 2 highlighted (blue, pulsing)
- [ ] ✅ Actions column shows "Approve" and "Reject" buttons

#### 5.4 Owner Approves Request
- [ ] Click "Approve" button on the request
- [ ] ✅ Button shows loading state briefly
- [ ] ✅ Toast shows "Request approved and executed"
- [ ] ✅ Status badge changes to "🟢 APPROVED" or "🟢 EXECUTED" (green)
- [ ] ✅ Workflow visualizer animates
- [ ] ✅ Step 3 "APPROVED" turns green
- [ ] ✅ Step 4 "EXECUTED" turns green
- [ ] ✅ Step 5 "ON-CHAIN" turns green
- [ ] ✅ Actions column shows "View Details" instead of buttons

#### 5.5 Verify Asset Transfer
- [ ] Click "Assets" in sidebar
- [ ] Find "SC-LAPTOP-001" card
- [ ] ✅ Assigned user changed to "Rahul Kumar"
- [ ] ✅ Shows new blockchain transaction hash
- [ ] ✅ Status still shows "ACTIVE"
- [ ] ✅ VERIFIED badge still present

### Part C: Manager Views Approved Request

#### 5.6 Manager Sees Completed Request
- [ ] Logout
- [ ] Login as Manager
- [ ] Go to Requests page
- [ ] ✅ Your request shows status "EXECUTED"
- [ ] ✅ All 5 workflow steps are green
- [ ] ✅ Can click to view details

---

## TEST 6: TRANSFER REJECTION (10 minutes)

### 6.1 Create Another Request
- [ ] Login as Manager
- [ ] Go to Assets page
- [ ] Click "Request Transfer"
- [ ] Select:
  - Asset: "SC-MOBILE-001 - iPhone 14 Pro"
  - Recipient: "Vikram Singh"
- [ ] Submit request
- [ ] ✅ Toast shows success
- [ ] ✅ Request created

### 6.2 Owner Rejects Request
- [ ] Logout
- [ ] Login as Owner
- [ ] Go to Requests page
- [ ] Find the new pending request
- [ ] Click "Reject" button
- [ ] ✅ Modal opens with textarea
- [ ] ✅ Title shows "Reject Request #[ID]"
- [ ] Enter rejection reason:
  ```
  This device is required for the current marketing project.
  Transfer cannot be approved at this time.
  Please submit again after Q3 completion.
  ```
- [ ] Click "Reject" button in modal
- [ ] ✅ Toast shows "Request rejected"
- [ ] ✅ Modal closes
- [ ] ✅ Status badge changes to "🔴 REJECTED" (red)
- [ ] ✅ Reason appears in "Reason" column
- [ ] ✅ Workflow shows rejection at step 2

### 6.3 Verify Rejection
- [ ] Go to Assets page
- [ ] Find "SC-MOBILE-001"
- [ ] ✅ Still assigned to "Ananya Rao" (unchanged)
- [ ] ✅ No new blockchain hash

### 6.4 Manager Views Rejection
- [ ] Logout
- [ ] Login as Manager
- [ ] Go to Requests page
- [ ] Find rejected request
- [ ] ✅ Status shows "REJECTED"
- [ ] Click "View Details"
- [ ] ✅ Modal shows rejection reason
- [ ] ✅ Can see why it was rejected

---

## TEST 7: REQUEST FILTERS (5 minutes)

### 7.1 Filter by Status
- [ ] Login as Owner
- [ ] Go to Requests page
- [ ] Click "PENDING" filter button
- [ ] ✅ Shows only pending requests
- [ ] Click "APPROVED" filter button
- [ ] ✅ Shows only approved/executed requests
- [ ] Click "REJECTED" filter button
- [ ] ✅ Shows only rejected requests
- [ ] Click "All" filter button
- [ ] ✅ Shows all requests

---

## TEST 8: USER VIEW (5 minutes)

### 8.1 User Cannot Request Transfers
- [ ] Logout
- [ ] Login as: priya@securechain.local / User@123
- [ ] Go to Assets page
- [ ] ✅ NO "Request Transfer" button visible
- [ ] ✅ Can view all assets
- [ ] ✅ Can click assets to see details
- [ ] ✅ Cannot modify anything

### 8.2 User Cannot Access Users Page
- [ ] Try to go to Users page
- [ ] ✅ Either redirected or shows access denied message

### 8.3 User Cannot Approve Requests
- [ ] Go to Requests page (if accessible)
- [ ] ✅ If page loads, no approve/reject buttons visible
- [ ] ✅ Or page shows access denied

---

## TEST 9: AUDITOR ACCESS (5 minutes)

### 9.1 Read-Only Access
- [ ] Logout
- [ ] Login as: auditor@securechain.local / Auditor@123
- [ ] Go to Dashboard
- [ ] ✅ Can view statistics
- [ ] Go to Users page (if accessible)
- [ ] ✅ NO "Register User" button
- [ ] Go to Assets page
- [ ] ✅ NO "Register Asset" button
- [ ] ✅ NO "Request Transfer" button
- [ ] Go to Requests page
- [ ] ✅ Can view requests
- [ ] ✅ NO approve/reject buttons

---

## TEST 10: NAVIGATION & UI (5 minutes)

### 10.1 Sidebar Navigation
- [ ] Login as any user
- [ ] ✅ Sidebar visible on left
- [ ] ✅ Logo shows at top
- [ ] ✅ Shows "SECURECHAIN" with shield icon
- [ ] Click each menu item:
  - [ ] ✅ Dashboard
  - [ ] ✅ Users (if permitted)
  - [ ] ✅ Assets
  - [ ] ✅ Requests
  - [ ] ✅ Digital Identity
  - [ ] ✅ Blockchain
  - [ ] ✅ Audit Logs
  - [ ] ✅ Security Center
- [ ] ✅ Active page highlighted in blue
- [ ] ✅ Hover effects work on menu items

### 10.2 Glass Morphism Effect
- [ ] Check all pages for glass effect
- [ ] ✅ Cards have frosted glass appearance
- [ ] ✅ Backgrounds show subtle blur
- [ ] ✅ Floating background orbs visible
- [ ] ✅ Hover effects enhance glass appearance
- [ ] ✅ Borders are subtle and translucent

### 10.3 Responsive Design
- [ ] Resize browser window
- [ ] ✅ Layout adapts to screen size
- [ ] ✅ Sidebar collapses on mobile
- [ ] ✅ Cards stack vertically on small screens
- [ ] ✅ No horizontal scrolling
- [ ] ✅ Text remains readable

---

## TEST 11: ERROR HANDLING (5 minutes)

### 11.1 Network Error Simulation
- [ ] Stop backend API
- [ ] Refresh page
- [ ] ✅ Shows error message
- [ ] ✅ Provides helpful feedback
- [ ] Start backend API
- [ ] Refresh page
- [ ] ✅ Works normally again

### 11.2 Form Validation
- [ ] Go to Register User form
- [ ] Try to submit empty form
- [ ] ✅ Shows validation errors
- [ ] Enter invalid email
- [ ] ✅ Shows email format error
- [ ] Enter weak password
- [ ] ✅ Shows password requirements

---

## TEST 12: LOGOUT (2 minutes)

### 12.1 Logout Functionality
- [ ] Click user avatar/menu in header
- [ ] Click "Logout"
- [ ] ✅ Redirects to login page
- [ ] ✅ Cannot access protected pages
- [ ] Try to go to /dashboard directly
- [ ] ✅ Redirects back to login

---

## 📊 FINAL VERIFICATION

### All Features Working
- [ ] ✅ All 7 users can login
- [ ] ✅ Dashboard shows correct statistics
- [ ] ✅ Users can be registered (Owner only)
- [ ] ✅ Assets can be registered (Owner only)
- [ ] ✅ Transfer requests can be created (Manager)
- [ ] ✅ Requests show PENDING status correctly
- [ ] ✅ Workflow visualizer shows all 5 steps
- [ ] ✅ Owner can approve requests
- [ ] ✅ Approval executes transfer immediately
- [ ] ✅ Asset ownership changes after approval
- [ ] ✅ Owner can reject requests with reason
- [ ] ✅ Rejection reason is stored and displayed
- [ ] ✅ Users cannot request transfers (UI hidden)
- [ ] ✅ Auditors have read-only access
- [ ] ✅ Glass morphism effect looks professional
- [ ] ✅ Toast notifications appear for all actions
- [ ] ✅ No console errors during testing

### Performance
- [ ] ✅ Pages load quickly (< 2 seconds)
- [ ] ✅ Transitions are smooth
- [ ] ✅ No lag when clicking buttons
- [ ] ✅ Search/filter responds instantly
- [ ] ✅ API calls complete reasonably fast

### Visual Quality
- [ ] ✅ Inter font renders clearly
- [ ] ✅ Text is readable (not too light)
- [ ] ✅ Colors are consistent
- [ ] ✅ Icons display correctly
- [ ] ✅ Badges use appropriate colors
- [ ] ✅ Cards have proper spacing
- [ ] ✅ Glass effect is subtle and professional

---

## 🎉 COMPLETION

### When All Boxes Checked:
**✅ YOUR DEMO IS PERFECT AND READY TO PRESENT! ✅**

### Issues Found?
1. Note the test number that failed
2. Check browser console for errors (F12)
3. Check backend logs
4. Review DEMO_GUIDE.md troubleshooting section

---

**Total Estimated Testing Time: 90 minutes**

**Recommended: Test in this order for best results.**
