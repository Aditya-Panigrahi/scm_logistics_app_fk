# Ekart Logistics - Quick Reference Guide

> 🎯 **Need feature overview?** See [README.md](../README.md) for complete feature list and architecture.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Starting the Application](#starting-the-application)
4. [Common Tasks](#common-tasks)
5. [Troubleshooting](#troubleshooting)
6. [Useful Commands](#useful-commands)

---

## Prerequisites

**Required Software:**
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 14+** - [Download Node.js](https://nodejs.org/)
- **Terminal/Command Prompt** - Windows PowerShell, Command Prompt, or Terminal

**Verify Installation:**
```bash
python --version          # Should show 3.8 or higher
node --version            # Should show 14 or higher
npm --version             # Comes with Node.js
```

---

## Initial Setup

### Step 1: Backend Setup

```bash
# Navigate to project root
cd scm_logistics_app_fk

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate              # Windows PowerShell/CMD
source .venv/bin/activate           # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create sample bins (optional but recommended)
python manage.py seed_data

# Create admin user (optional)
python manage.py createsuperuser
# Enter username: superadmin (or your choice)
# Enter password: ******** (your choice)
```

### Step 2: Frontend Setup

```bash
# Open NEW terminal (keep backend terminal open)
cd scm_logistics_app_fk/frontend

# Install dependencies
npm install
```

**✅ Setup Complete!** You're ready to start the application.

---

## Starting the Application

### Every Time You Start

**Terminal 1 - Backend:**
```bash
# Navigate to project root
cd scm_logistics_app_fk

# Activate virtual environment
.venv\Scripts\activate              # Windows
source .venv/bin/activate           # Mac/Linux

# Start Django server
python manage.py runserver
```
✅ Backend running at: **http://localhost:8000**

**Terminal 2 - Frontend:**
```bash
# Navigate to frontend folder
cd scm_logistics_app_fk/frontend

# Start React server
npm start
```
✅ Frontend running at: **http://localhost:3000**

**Browser will auto-open to http://localhost:3000**

### Verify Everything Works

1. Open **http://localhost:3000** in browser
2. You should see **Ekart logo** and landing page
3. Try clicking **"Inbound Process"** - should load page
4. Test **API** directly: **http://localhost:8000/api/bins/**

---

## Common Tasks

### Create Warehouse (Superadmin Only)

**Option 1: Via Django Shell**
```bash
python manage.py shell
```
```python
from accounts.models import Warehouse

# Create warehouse
Warehouse.objects.create(
    warehouse_id='WH001',
    name='Main Warehouse',
    location='Bangalore, Karnataka',
    contact_email='bangalore@ekart.com',
    contact_phone='+91-80-12345678',
    is_active=True
)

# Verify
Warehouse.objects.all()
exit()
```

**Option 2: Via Django Admin**
1. Go to **http://localhost:8000/admin**
2. Login with superuser credentials
3. Click **Warehouses** → **Add Warehouse**
4. Fill form and save

**Option 3: Via UI (if logged in as superadmin)**
1. Login to app
2. Navigate to **Warehouse Management** (🏢)
3. Click **"Create New Warehouse"**
4. Fill form and save

### Create Users

**Via UI (Recommended):**
1. Login as **superadmin** or **warehouse_admin**
2. Navigate to **User Management** (👥)
3. Click **"Create New User"**
4. Fill details:
   - Username, Email, Password
   - Role: SUPERADMIN | OPERATION_HEAD | WAREHOUSE_ADMIN | OPERATOR
   - Warehouse assignment
5. Click **"Create User"**

**Via Django Admin:**
1. Go to **http://localhost:8000/admin**
2. Click **Users** → **Add User**
3. Fill form and save

### Assign Package to Bin (Inbound)

1. Navigate to **Inbound Process**
2. Enter or scan **Bin ID** (e.g., BIN-001)
3. Click **"Scan Bin"**
4. Enter or scan **Tracking ID** (e.g., TRK2025001)
5. Click **"Assign Package"**
6. ✅ Package assigned to bin

### Pickup Packages (Outbound - Bin Mode)

1. Navigate to **Outbound Process**
2. Stay on **"Pickup by Bin"** tab
3. Enter **Bin ID** and click **"Load Shipments"**
4. Click **"Start Scanning"** for bulk mode
5. Scan each package's **Tracking ID**
6. When done, click **"Dispatch"**
7. Scan **Bin ID** to confirm

### Create Picklist and Assign to Operator (File Mode)

**Admin/Warehouse Admin:**
1. Navigate to **Outbound Process**
2. Switch to **"Pickup by File"** tab
3. Click **"Choose File"** → Upload CSV/JSON
4. Review loaded packages (shows Manifested/Direct status)
5. Click **"Assign to Operator"**
6. Select operator or **"Auto Assign"** for round-robin
7. Click **"Confirm Assignment"**
8. Status changes to **"Picklist Created"**

**Operator:**
1. Login as operator
2. View **"My Assigned Shipments"** section
3. Find package to dispatch
4. Click **"Dispatch"** button
5. Scan or enter **Tracking ID** to confirm
6. ✅ Package dispatched

### Upload Manifest

1. Navigate to **Manifest Creation**
2. Prepare CSV/JSON file with tracking IDs
3. Click **"Choose File"** and select file
4. Click **"Upload Manifest"**
5. View success/failure report
6. Packages marked as **"manifested"**

### Reset Database

**⚠️ Warning: This deletes all data!**

```bash
# Windows
del db.sqlite3
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser

# Mac/Linux
rm db.sqlite3
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser
```

### Switch Warehouse (Superadmin)

1. Go to **Home** page
2. Find **"Select Warehouse"** dropdown (center, above app cards)
3. Click to expand
4. Select desired warehouse
5. All data now filtered to that warehouse

---

## Troubleshooting

### Backend Issues

#### ❌ "No module named 'django'"
**Cause:** Virtual environment not activated or dependencies not installed

**Fix:**
```bash
# Activate venv
.venv\Scripts\activate              # Windows
source .venv/bin/activate           # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

#### ❌ "Port 8000 already in use"
**Cause:** Another Django server running

**Fix (Windows):**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Fix (Mac/Linux):**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9
```

**Alternative:** Use different port
```bash
python manage.py runserver 8001
# Update frontend API URL to http://localhost:8001/api
```

#### ❌ "No such table: inbound_bin"
**Cause:** Migrations not applied

**Fix:**
```bash
python manage.py migrate
```

#### ❌ Django admin login fails
**Cause:** Superuser not created

**Fix:**
```bash
python manage.py createsuperuser
```

### Frontend Issues

#### ❌ "npm: command not found"
**Cause:** Node.js not installed

**Fix:**
1. Download Node.js from https://nodejs.org/
2. Install Node.js
3. Restart terminal
4. Verify: `npm --version`

#### ❌ "Cannot find module 'react'"
**Cause:** Dependencies not installed

**Fix:**
```bash
cd frontend
npm install
```

#### ❌ "Port 3000 already in use"
**Cause:** Another React app running

**Fix:**
- Press `Ctrl+C` in React terminal
- Or kill the process
- Then: `npm start`

#### ❌ Blank page in browser
**Possible causes:**
1. Backend not running
2. CORS misconfigured
3. API URL incorrect

**Fix:**
1. Check backend is running: `http://localhost:8000/api/bins/`
2. Check browser console (F12) for errors
3. Verify `frontend/src/services/api.js`:
   ```javascript
   baseURL: 'http://localhost:8000/api'
   ```
4. Check `backend/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
   ]
   ```

### CORS Errors

#### ❌ "CORS policy: No 'Access-Control-Allow-Origin' header"
**Cause:** CORS not configured

**Fix in `backend/settings.py`:**
```python
INSTALLED_APPS = [
    'corsheaders',              # Must be here
    'django.contrib.admin',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Near top
    'django.middleware.security.SecurityMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # Must match frontend URL
]
```

Restart Django server after changes.

### Camera/Scanner Issues

#### ❌ Camera not working
**Possible causes:**
- Browser permissions denied
- Camera in use by another app
- Not using localhost or HTTPS

**Fix:**

**1. Check Browser Permissions:**
- **Chrome:** Click lock icon → Site settings → Camera → Allow
- **Firefox:** Click shield icon → Permissions → Camera → Allow
- **Safari:** Safari → Preferences → Websites → Camera → Allow

**2. Use Correct URL:**
- ✅ **Use:** `http://localhost:3000`
- ❌ **Don't use:** `http://192.168.x.x:3000` (requires HTTPS)

**3. Close Other Apps:**
- Close Zoom, Teams, Skype, or other apps using camera
- Restart browser

**4. Browser Compatibility:**
- **Chrome/Edge:** ✅ Fully supported
- **Firefox:** ✅ Supported
- **Safari:** ⚠️ May have restrictions (works on localhost)

**5. Fallback:** Always use manual entry as alternative

#### ❌ Scanner detects but doesn't recognize codes
**Fix:**
- Ensure **good lighting**
- Hold code **steady and straight**
- Try **different distance** from camera (6-12 inches works best)
- Use **high-quality** printed/displayed codes
- Try **manual entry** if scanner fails

### Database Issues

#### ❌ "database is locked"
**Cause:** SQLite limitation (concurrent writes)

**Fix:**
- Wait a few seconds
- Retry operation
- For production, use PostgreSQL

#### ❌ Migrations conflict
**Fix:**
```bash
# Delete migrations
rm -r accounts/migrations/     # Mac/Linux
rm -r inbound/migrations/
rmdir /s accounts\migrations   # Windows
rmdir /s inbound\migrations

# Recreate
python manage.py makemigrations accounts
python manage.py makemigrations inbound
python manage.py migrate
```

### Connection Issues

#### ❌ Frontend can't connect to backend
**Checklist:**

1. **✅ Is backend running?**
   ```bash
   curl http://localhost:8000/api/bins/
   # Should return JSON or error page
   ```

2. **✅ Is frontend API URL correct?**
   Check `frontend/src/services/api.js`:
   ```javascript
   baseURL: 'http://localhost:8000/api'
   ```

3. **✅ Is CORS configured?**
   Check `backend/settings.py` (see CORS section above)

4. **✅ Firewall blocking?**
   - Windows: Check Windows Defender Firewall
   - Mac: System Preferences → Security & Privacy → Firewall
   - Temporarily disable to test

5. **✅ Check browser console (F12)**
   - Look for error messages
   - Check Network tab for failed requests

---

## Useful Commands

### Django Commands

```bash
# Run server
python manage.py runserver

# Run on different port
python manage.py runserver 8001

# Apply database changes
python manage.py migrate

# Create new migrations
python manage.py makemigrations

# Create admin user
python manage.py createsuperuser

# Generate sample bins
python manage.py seed_data

# Open Django shell
python manage.py shell

# Show migrations status
python manage.py showmigrations

# Collect static files (for production)
python manage.py collectstatic
```

### Django Shell Examples

```bash
python manage.py shell
```

```python
# View all users
from accounts.models import CustomUser
CustomUser.objects.all()

# View all warehouses
from accounts.models import Warehouse
Warehouse.objects.all()

# View all bins
from inbound.models import Bin
Bin.objects.all()

# View all shipments
from inbound.models import Shipment
Shipment.objects.all()

# Count shipments by status
Shipment.objects.values('status').annotate(count=Count('status'))

# Delete all shipments (CAREFUL!)
Shipment.objects.all().delete()

# Exit shell
exit()
```

### NPM Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Git Commands (Optional)

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# View status
git status

# View changes
git diff
```

---

## Sample Data

### Sample Bin IDs (after `seed_data`)
```
BIN-001, BIN-002, BIN-003, BIN-004, BIN-005
BIN-006, BIN-007, BIN-008, BIN-009, BIN-010
```

### Sample Tracking ID Formats
```
TRK2025001
TRK2025002
PKG-0001
PKG-0002
SHIP123456
```

### CSV Format for Manifest Upload
```csv
tracking_id
TRK2025001
TRK2025002
TRK2025003
```

### JSON Format for Picklist Upload
```json
{
  "tracking_ids": [
    "TRK2025001",
    "TRK2025002",
    "TRK2025003"
  ]
}
```

---

## Development Tips

### Best Practices

1. **Keep both servers running** in separate terminals
2. **Use browser DevTools** (F12) to debug
   - Console tab for errors
   - Network tab for API calls
3. **Check terminal logs** for backend errors
4. **Use Django admin** for direct database access
5. **Git commit regularly** (if using version control)

### Debugging Workflow

**Frontend Issue:**
1. Open browser console (F12)
2. Check Console tab for errors
3. Check Network tab for failed API calls
4. Verify API response in Network → Response tab

**Backend Issue:**
1. Check Django terminal for error traceback
2. Use Django admin to verify database state
3. Use Django shell to test queries
4. Check `backend/settings.py` configuration

### Testing API with cURL

```bash
# Get bins
curl http://localhost:8000/api/bins/

# Login (get JWT token)
curl -X POST http://localhost:8000/api/accounts/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"yourpassword"}'

# Use token in request
curl http://localhost:8000/api/bins/ \
  -H "Authorization: Bearer <access_token>"
```

### Testing API with Postman

1. Download **Postman** from https://www.postman.com/
2. Create collection "Ekart Logistics"
3. Add requests:
   - **Login:** POST `http://localhost:8000/api/accounts/auth/login/`
   - **Get Bins:** GET `http://localhost:8000/api/bins/`
4. Use token from login response in Authorization header

---

## FAQ

**Q: Do I need to run seed_data every time?**
A: No, only once during initial setup. Data persists in `db.sqlite3`.

**Q: Can I run this in production?**
A: SQLite is fine for small deployments. For production, consider PostgreSQL and proper hosting.

**Q: How do I deploy this?**
A: Backend can deploy to Heroku, AWS, or any Python hosting. Frontend can deploy to Netlify, Vercel, or serve static build.

**Q: Can multiple users access simultaneously?**
A: Yes, but SQLite has limitations with concurrent writes. Use PostgreSQL for heavy traffic.

**Q: How do I change the port?**
A: Backend: `python manage.py runserver <port>`. Frontend: Set `PORT=3001` env variable.

**Q: Where is data stored?**
A: `db.sqlite3` file in project root. Backup this file to preserve data.

**Q: Can I use MySQL/PostgreSQL instead of SQLite?**
A: Yes, update `DATABASES` in `backend/settings.py` and install appropriate Python driver.

**Q: How do I update Python packages?**
A: `pip install --upgrade -r requirements.txt`

**Q: How do I update NPM packages?**
A: `cd frontend && npm update`

---

## Additional Resources

- **Django Docs:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **React Docs:** https://react.dev/
- **JWT Auth:** https://django-rest-framework-simplejwt.readthedocs.io/

---

## Getting Help

**If you're stuck:**
1. Check this guide's troubleshooting section
2. Check browser console (F12) for errors
3. Check Django terminal for error traceback
4. Verify both servers are running
5. Try restarting both servers
6. Check [README.md](../README.md) for architecture details

**Common First-Time Issues:**
- ✅ Virtual environment not activated → Run activate command
- ✅ Dependencies not installed → Run `pip install` / `npm install`
- ✅ Migrations not run → Run `python manage.py migrate`
- ✅ Wrong directory → Ensure you're in project root

---

**🎉 You're all set! Happy coding!**

For feature details and architecture, see [README.md](../README.md)
