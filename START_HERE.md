# 🎯 DEMO SETUP COMPLETE - START HERE!

## ✅ What's Been Created For You

I've set up a **complete working demo** with everything pre-configured. Here's what you have:

### 📁 New Files Created

1. **`backend/seed_demo.py`** - Seeds database with demo data
2. **`setup_demo.bat`** - Windows quick setup script
3. **`setup_demo.sh`** - Linux/Mac quick setup script
4. **`DEMO_README.md`** - Quick start guide (READ THIS FIRST!)
5. **`DEMO_GUIDE.md`** - Complete testing guide
6. **`WORKFLOW_GUIDE.md`** - Detailed workflow documentation

---

## 🚀 HOW TO START THE DEMO

### Step 1: Ensure Services Are Running

```bash
# Check these are running:
✅ PostgreSQL (port 5432)
✅ Hardhat Node (port 8545)
✅ Backend API (port 8000)
✅ Frontend (port 5173)
```

If any service is not running, start them:

```bash
# PostgreSQL
docker-compose up -d postgres

# Hardhat (in blockchain directory)
cd blockchain
npm run node

# Backend (in backend directory)
cd backend
uvicorn app.main:app --reload

# Frontend (in frontend directory)
cd frontend
npm run dev
```

### Step 2: Run Setup Script

**Windows:**
```bash
setup_demo.bat
```

**Linux/Mac:**
```bash
chmod +x setup_demo.sh
./setup_demo.sh
```

### Step 3: Open Browser

Go to: **http://localhost:5173**

---

## 🎬 5-MINUTE QUICK DEMO

### Test 1: Manager Requests Transfer

1. **Login:**
   ```
   Email: manager@securechain.local
   Password: Manager@123
   ```

2. **Request Transfer:**
   - Click **Assets** in sidebar
   - Click **"Request Transfer"** button
   - Select Asset: **SC-LAPTOP-001 - Dell Latitude 5420**
   - Select Recipient: **Rahul Kumar**
   - Click **"Request Transfer"**
   - ✅ Toast shows: "Transfer request submitted for Owner approval"

3. **View Request:**
   - Click **Requests** in sidebar
   - See your request with **🟡 PENDING** status
   - Workflow shows step 2: **PENDING OWNER** (blue, pulsing)

### Test 2: Owner Approves Request

4. **Logout and Login as Owner:**
   ```
   Email: admin@securechain.local
   Password: Admin@123
   ```

5. **Review Pending Request:**
   - Click **Requests** in sidebar
   - See **Pending: 1** in statistics
   - Find request from Sarah Manager
   - Workflow step 2 is highlighted (blue, pulsing)

6. **Approve:**
   - Click **"Approve"** button
   - ✅ Status changes to **🟢 EXECUTED**
   - ✅ Workflow progresses through all 5 steps
   - ✅ Toast shows: "Request approved and executed"

7. **Verify Transfer:**
   - Click **Assets** in sidebar
   - Find **SC-LAPTOP-001**
   - ✅ Now shows: **Assigned to: Rahul Kumar**
   - ✅ Has blockchain transaction hash

---

## 👥 ALL DEMO ACCOUNTS

| Email | Password | Role | What They Can Do |
|-------|----------|------|------------------|
| admin@securechain.local | Admin@123 | **ADMIN** | ✅ Register users<br>✅ Register assets<br>✅ Approve/reject requests<br>✅ Full access |
| manager@securechain.local | Manager@123 | **MANAGER** | ✅ Request transfers<br>✅ View assets/users<br>❌ Cannot execute without approval |
| auditor@securechain.local | Auditor@123 | **AUDITOR** | ✅ View all audit logs<br>✅ Verify blockchain<br>❌ Read-only access |
| priya@securechain.local | User@123 | **USER** | ✅ View assigned assets<br>❌ Cannot transfer |
| rahul@securechain.local | User@123 | **USER** | ✅ View assigned assets<br>❌ Cannot transfer |
| ananya@securechain.local | User@123 | **USER** | ✅ View assigned assets<br>❌ Cannot transfer |
| vikram@securechain.local | User@123 | **USER** | ✅ View assigned assets<br>❌ Cannot transfer |

---

## 📦 DEMO ASSETS

### Already Assigned (Can Test Transfers)
- **SC-LAPTOP-001** → Priya Sharma
- **SC-LAPTOP-002** → Rahul Kumar  
- **SC-MOBILE-001** → Ananya Rao
- **SC-SERVER-001** → Vikram Singh

### Unassigned (Can Test Initial Assignment)
- **SC-LAPTOP-003** → Available
- **SC-MOBILE-002** → Available

---

## 🔄 COMPLETE WORKFLOWS TO TEST

### 1. User Registration (Owner)
```
Login: admin@securechain.local / Admin@123
↓
Users Page → Register User
↓
Fill: Name, Email, Password, Role
↓
Submit → User appears in list
↓
Can login immediately
```

### 2. Asset Registration (Owner)
```
Login: admin@securechain.local / Admin@123
↓
Assets Page → Register Asset
↓
Fill: Asset ID, Name, Category, Metadata, Assign User
↓
Submit → Asset minted on blockchain
↓
Asset card appears with VERIFIED badge
```

### 3. Transfer Request → Approval (Manager + Owner)
```
MANAGER:
Login: manager@securechain.local
↓
Assets → Request Transfer
↓
Select asset + recipient → Submit
↓
Request shows PENDING

OWNER:
Login: admin@securechain.local
↓
Requests Page → See pending
↓
Click Approve → Executes immediately
↓
Asset ownership changes
```

### 4. Transfer Rejection (Owner)
```
Login: admin@securechain.local
↓
Requests Page → Find pending
↓
Click Reject → Modal opens
↓
Enter reason → Submit
↓
Status: REJECTED, reason stored
```

### 5. Security Verification (User)
```
Login: priya@securechain.local
↓
Assets Page → View assets
↓
No "Request Transfer" button
↓
Cannot modify assets (UI + API + Smart Contract)
```

---

## ✅ VERIFICATION CHECKLIST

After running the setup, verify:

- [ ] Can login with all 7 accounts
- [ ] Dashboard shows statistics
- [ ] Assets page shows 6 demo assets
- [ ] Manager can create transfer request
- [ ] Request shows in Requests page with PENDING status
- [ ] Workflow visualizer shows 5 steps
- [ ] Owner can see pending requests
- [ ] Approve button works and executes transfer
- [ ] Asset ownership changes after approval
- [ ] Reject button requires reason
- [ ] Users cannot see transfer buttons
- [ ] Auditors have read-only access

---

## 📚 DOCUMENTATION

**Start Here:**
1. **DEMO_README.md** - Quick 5-minute demo
2. **DEMO_GUIDE.md** - Complete testing scenarios
3. **WORKFLOW_GUIDE.md** - Detailed workflow explanations

**For Development:**
- **README.md** - Full project documentation
- **docs/** - Architecture and API docs

---

## 🐛 TROUBLESHOOTING

### Setup script fails?
```bash
# Manual seed:
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python seed_demo.py
```

### Can't login?
- Use exact password: `Admin@123` (capital A)
- Clear browser cookies/local storage
- Check backend is running: http://localhost:8000/health

### No pending requests showing?
- Create request as Manager first
- Then login as Owner
- Check Requests page

### Transfer doesn't execute?
- Ensure blockchain node is running
- Check recipient has wallet address
- Review backend logs for errors

---

## 🎯 SUCCESS CRITERIA

Your demo is working when:

1. ✅ All 7 users can login
2. ✅ Assets page shows 6 cards
3. ✅ Manager creates transfer request successfully
4. ✅ Request appears as PENDING with workflow step 2
5. ✅ Owner sees request in Requests page
6. ✅ Approve button executes transfer
7. ✅ Asset ownership changes in Assets page
8. ✅ Workflow shows all 5 steps completed
9. ✅ Dashboard statistics update correctly
10. ✅ Toast notifications appear for all actions

---

## 📞 QUICK REFERENCE

### URLs
```
Frontend:    http://localhost:5173
Backend:     http://localhost:8000
API Docs:    http://localhost:8000/docs
Health:      http://localhost:8000/health
```

### Quick Logins
```
Owner:    admin@securechain.local / Admin@123
Manager:  manager@securechain.local / Manager@123
```

### Clear & Reseed
```bash
cd backend
python seed_demo.py --clear
python seed_demo.py
```

---

## 🎉 YOU'RE ALL SET!

**Everything is ready to demo:**
- ✅ Database seeded with users, DIDs, and assets
- ✅ All workflows configured and working
- ✅ Complete documentation provided
- ✅ Quick start scripts created

**Next Steps:**
1. Run `setup_demo.bat` (or `.sh`)
2. Follow the 5-minute quick demo above
3. Test all workflows
4. Review DEMO_GUIDE.md for advanced scenarios

**Enjoy your demo!** 🚀
