# 🎯 SecureChain Demo - Quick Start

## 🚀 One-Command Setup

### Windows
```bash
setup_demo.bat
```

### Linux/Mac
```bash
chmod +x setup_demo.sh
./setup_demo.sh
```

---

## ✅ What You Get

### 👥 7 Pre-configured Users

| Login | Password | Role |
|-------|----------|------|
| admin@securechain.local | Admin@123 | Owner (Full Access) |
| manager@securechain.local | Manager@123 | Manager (Request Transfers) |
| auditor@securechain.local | Auditor@123 | Auditor (Read-Only) |
| priya@securechain.local | User@123 | Employee |
| rahul@securechain.local | User@123 | Employee |
| ananya@securechain.local | User@123 | Employee |
| vikram@securechain.local | User@123 | Employee |

### 📦 6 Demo Assets

| Asset | Assigned To |
|-------|-------------|
| Dell Latitude 5420 (Laptop) | Priya Sharma |
| HP EliteBook 840 (Laptop) | Rahul Kumar |
| iPhone 14 Pro (Mobile) | Ananya Rao |
| Dell PowerEdge R740 (Server) | Vikram Singh |
| Lenovo ThinkPad X1 (Laptop) | Unassigned |
| Samsung Galaxy S23 (Mobile) | Unassigned |

---

## 🎬 Quick Demo (5 Minutes)

### 1️⃣ Login as Manager (1 min)
```
http://localhost:5173/login

Email: manager@securechain.local
Password: Manager@123
```

### 2️⃣ Request Transfer (1 min)
- Go to **Assets** page
- Click **"Request Transfer"**
- Select:
  - Asset: **SC-LAPTOP-001 - Dell Latitude 5420**
  - Recipient: **Rahul Kumar**
- Click **"Request Transfer"**
- ✅ See **PENDING** status

### 3️⃣ Approve as Owner (2 min)
- Logout
- Login as **admin@securechain.local** / **Admin@123**
- Go to **Requests** page
- See pending request from Sarah Manager
- Click **"Approve"**
- ✅ Status changes to **EXECUTED**

### 4️⃣ Verify Transfer (1 min)
- Go to **Assets** page
- Find **SC-LAPTOP-001**
- ✅ Now assigned to **Rahul Kumar** (changed from Priya Sharma)

---

## 📚 Full Documentation

- **Complete Workflow Guide:** [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)
- **Demo Testing Guide:** [DEMO_GUIDE.md](DEMO_GUIDE.md)
- **Main README:** [README.md](README.md)

---

## 🔧 Manual Setup (If Script Fails)

```bash
# 1. Start services
docker-compose up -d postgres redis
cd blockchain && npm run node &
cd backend && uvicorn app.main:app --reload &
cd frontend && npm run dev &

# 2. Seed data
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python seed_demo.py
```

---

## 🆘 Troubleshooting

### Seed script fails?
```bash
# Check PostgreSQL
docker ps | grep postgres

# Check database connection
psql -U postgres -d securechain -h localhost -p 5432
```

### Can't login?
- Password is case-sensitive: `Admin@123` not `admin@123`
- Clear browser cookies
- Check backend logs

### No pending requests?
- Ensure you logged in as Manager first
- Created a transfer request
- Then logged in as Owner

---

## 📞 Quick Links

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## 🎉 Ready!

You now have a fully functional demo with:
- ✅ 7 users with different roles
- ✅ 6 assets (4 assigned, 2 unassigned)
- ✅ Digital identities (DIDs) for all users
- ✅ Wallet addresses linked
- ✅ Ready to test complete workflows

**Start with the 5-minute quick demo above!** 🚀
