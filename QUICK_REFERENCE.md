# Quick Reference - Ekart Logistics App

> 🎯 **Need feature details?** See [README.md](README.md) for complete app documentation.

## 📋 Prerequisites

Before starting, ensure you have:
- **Python 3.8+** installed
- **Node.js 14+** and npm installed
- **Terminal/Command Prompt** access

## 🚀 Initial Setup (First Time Only)

### Step 1: Backend Setup

```bash
# Navigate to project directory
cd scm_logistics_app_fk

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate              # Windows
source .venv/bin/activate           # Mac/Linux

# Install Python dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Create sample bins (optional but recommended)
python manage.py seed_data

# Create admin user (optional)
python manage.py createsuperuser
```

### Step 2: Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install
```

## ▶️ Starting the Application

### Start Backend Server

```bash
# Activate virtual environment (if not already active)
.venv\Scripts\activate              # Windows
source .venv/bin/activate           # Mac/Linux

# Start Django server
python manage.py runserver
```

✅ **Backend running at:** http://localhost:8000

### Start Frontend Server

```bash
# In a new terminal
cd frontend

# Start React development server
npm start
```

✅ **Frontend running at:** http://localhost:3000

### Verify Setup

1. Open browser to http://localhost:3000
2. You should see the Ekart landing page
3. Click "Inbound Process" to test the app


## 🛠️ Troubleshooting Guide

### Backend Issues

#### Issue: "No module named 'django'"
**Cause:** Virtual environment not activated or dependencies not installed

**Solution:**
```bash
# Activate virtual environment
.venv\Scripts\activate              # Windows
source .venv/bin/activate           # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

#### Issue: "Port 8000 already in use"
**Cause:** Another Django server is running

**Solution:**
```bash
# Find and kill the process (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port
python manage.py runserver 8001
```

#### Issue: "No such table: inbound_bin"
**Cause:** Database migrations not applied

**Solution:**
```bash
python manage.py migrate
```

#### Issue: Django admin login not working
**Cause:** Superuser not created

**Solution:**
```bash
python manage.py createsuperuser
# Follow prompts to create username/password
```

### Frontend Issues

#### Issue: "npm: command not found"
**Cause:** Node.js not installed

**Solution:**
- Download and install Node.js from https://nodejs.org/
- Restart terminal after installation

#### Issue: "Cannot find module 'react'"
**Cause:** Dependencies not installed

**Solution:**
```bash
cd frontend
npm install
```

#### Issue: "Port 3000 already in use"
**Cause:** Another React app is running

**Solution:**
- Press `Ctrl+C` in the terminal running React
- Or kill the process and restart

#### Issue: Blank page in browser
**Cause:** Backend not running or CORS misconfigured

**Solution:**
1. Ensure backend is running on port 8000
2. Check browser console for errors
3. Verify CORS settings in `backend/settings.py`

### CORS Errors

#### Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Cause:** CORS not configured properly

**Solution:**
```python
# In backend/settings.py, verify:
INSTALLED_APPS = [
    'corsheaders',  # Must be here
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Near top
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Must match frontend URL
]
```

Then restart Django server.

### Camera Scanner Issues

#### Issue: Camera not working
**Possible causes:**
- Browser permissions denied
- Not using HTTPS or localhost
- Camera in use by another app

**Solutions:**
1. **Check browser permissions:**
   - Chrome: Click lock icon → Site settings → Camera → Allow
   - Firefox: Click shield icon → Permissions → Camera → Allow

2. **Use correct URL:**
   - ✅ Use: `http://localhost:3000`
   - ❌ Don't use: `http://192.168.x.x:3000` (won't work without HTTPS)

3. **Close other apps:**
   - Close Zoom, Teams, or other apps using camera
   - Restart browser

4. **Browser compatibility:**
   - Chrome/Edge: ✅ Fully supported
   - Firefox: ✅ Supported
   - Safari: ⚠️ May have restrictions

#### Issue: Scanner modal opens but doesn't detect codes
**Solutions:**
- Ensure good lighting
- Hold code steady and straight
- Try different distance from camera
- Use manual entry as fallback

### Database Issues

#### Issue: "database is locked"
**Cause:** SQLite limitation (concurrent writes)

**Solution:**
- Wait a few seconds and retry
- For production, use PostgreSQL instead

#### Issue: Want to reset database
**Solution:**
```bash
# Delete database file
rm db.sqlite3              # Mac/Linux
del db.sqlite3             # Windows

# Recreate database
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser
```

### Connection Issues

#### Issue: Frontend can't connect to backend
**Checklist:**
1. ✅ Backend running on port 8000?
   ```bash
   curl http://localhost:8000/api/bins/
   ```

2. ✅ Frontend configured correctly?
   - Check `frontend/src/services/api.js`
   - Should have: `const API_BASE_URL = 'http://localhost:8000/api';`

3. ✅ Firewall not blocking?
   - Temporarily disable firewall to test
   - Add exception for Python/Node.js

4. ✅ CORS configured?
   - See CORS section above

## 💡 Quick Tips & Shortcuts

### Development Workflow

1. **Keep both servers running** in separate terminals
2. **Use browser DevTools** (F12) to debug issues
3. **Check terminal logs** for backend errors
4. **Use Django admin** (http://localhost:8000/admin) to view data

### Testing Data

**Sample Bin IDs:** (after running `seed_data`)
```
BIN-001, BIN-002, BIN-003, ... BIN-010
```

**Sample Tracking IDs format:**
```
TRK2025001, TRK2025002, PKG-0001, etc.
```

### Useful Commands

```bash
# View all bins in database
python manage.py shell
>>> from inbound.models import Bin
>>> Bin.objects.all()

# Clear all shipments
>>> from inbound.models import Shipment
>>> Shipment.objects.all().delete()

# Check Django version
python -m django --version

# Check React version
npm list react
```

## 📱 Camera Scanner Quick Guide

### First Time Setup
1. Click camera icon (📷) next to any input field
2. Browser asks for camera permission
3. Click **"Allow"**
4. Scanner ready!

### Scanning Process
1. Click camera icon
2. Position barcode/QR code in frame
3. Scanner auto-detects and fills input
4. Modal closes automatically

### Supported Formats
✅ QR Codes  
✅ Barcodes (EAN-13, EAN-8, UPC-A, UPC-E)  
✅ Code 128, Code 39  
✅ ITF, Codabar

### Manual Entry Fallback
- Scanner optional - manual entry always works
- Use keyboard or copy-paste
- Same validation applies

## 🔄 Common Workflows


## 🔄 Common Workflows

### Inbound: Receive Package

1. Open **Inbound Process** from landing page
2. **Scan/Enter bin ID** → Click "Validate Bin"
3. **Scan/Enter tracking ID** → Click "Validate Package"
4. Click **"Assign Package to Bin"**
5. Success! Package stored

### Outbound: Pick Package

**Method 1: Individual Pickup**
1. Open **Outbound Process** → "Search Package" tab
2. Enter tracking ID to find bin location
3. Go to **"Pick Up Package"** tab
4. Enter tracking ID and bin ID
5. Click **"Pick Up Package"**
6. Package removed from bin

**Method 2: Batch Pickup**
1. Go to **"Pickup by Bin"** tab
2. Enter bin ID → Load packages
3. Verify each package
4. Dispatch all at once

### Manifest: Bulk Upload

1. Open **Manifest Creation**
2. Prepare CSV file with tracking IDs:
   ```csv
   tracking_id
   TRK2025001
   TRK2025002
   ```
3. Click **"Choose File"** → Select CSV
4. Click **"Upload & Process"**
5. View success/failure report

## 📊 Accessing Admin Panel

```bash
# First time: Create superuser
python manage.py createsuperuser

# Visit admin panel
http://localhost:8000/admin
```

**Use admin to:**
- View all bins and packages
- Manually edit data
- Check audit logs
- Monitor database

## 🔐 Configuration Notes

### Development vs Production

**Current settings (Development):**
```python
DEBUG = True
SECRET_KEY = 'dev-key-change-in-production'
ALLOWED_HOSTS = []
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

**For Production, change:**
```python
DEBUG = False
SECRET_KEY = 'your-secret-key-here'  # Generate new one
ALLOWED_HOSTS = ['yourdomain.com']
CORS_ALLOWED_ORIGINS = ["https://yourdomain.com"]

# Use PostgreSQL instead of SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        ...
    }
}
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `requirements.txt` | Python dependencies list |
| `manage.py` | Django management script |
| `db.sqlite3` | SQLite database file |
| `backend/settings.py` | Django configuration |
| `frontend/src/services/api.js` | API endpoint configuration |
| `sample_manifest.csv` | Example manifest format |

## 🎯 Status Flow Reference

```
Package Lifecycle:
manifested → putaway → picklist-created → picked → dispatched
```

**Status Definitions:**
- **manifested**: Registered with delivery partner
- **putaway**: Stored in bin
- **picklist-created**: Marked for pickup
- **picked**: Removed from bin
- **dispatched**: Sent for delivery

## 🌐 Network Access

### Local Development
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Admin: `http://localhost:8000/admin`

### Mobile/Other Devices (Same Network)

**Find your IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

**Access from phone:**
- Backend: `http://192.168.1.X:8000`
- Frontend: `http://192.168.1.X:3000`

⚠️ **Note:** Camera scanner may not work without HTTPS on mobile devices.

## 📚 Additional Resources

- **Complete Documentation:** [README.md](README.md)
- **Sample Files:** 
  - [sample_manifest.csv](sample_manifest.csv) - Manifest format example
  - [upload_manifest.csv](upload_manifest.csv) - Picklist format
- **API Testing:** Use Django browsable API at `http://localhost:8000/api/`

## 🆘 Still Having Issues?

1. **Check terminal logs** for error messages
2. **Open browser DevTools** (F12) → Console tab
3. **Verify all prerequisites** installed
4. **Try restarting** both servers
5. **Check this guide** for specific error messages

## 🎓 Learning Resources

- **Django:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **React:** https://react.dev/
- **React Router:** https://reactrouter.com/

---

**Quick Reference Version 1.0** | Last Updated: December 2025

1. **manifested**: Created via manifest upload
2. **putaway**: Assigned to bin (inbound)
3. **picklist-created**: Added to picklist (file upload)
4. **picked**: Confirmed pickup (verification)
5. **dispatched**: Final dispatch confirmed

## 🐛 Common Issues

**Issue**: Camera permission denied  
**Solution**: Reset permissions in browser settings

**Issue**: Package already exists  
**Solution**: Use a unique tracking ID or check if already in system

**Issue**: Bin not available  
**Solution**: Check bin status - ensure it's not full or in maintenance

**Issue**: CORS errors  
**Solution**: Ensure both Django (8000) and React (3000) servers are running

**Issue**: Virtual environment not activated  
**Solution**: Run `.venv\Scripts\activate` before Django commands

**Issue**: Module not found  
**Solution**: Install requirements: `pip install -r requirements.txt`

## 💡 Pro Tips

- Use keyboard shortcuts: Tab to navigate
- Scanner works best with good lighting
- Print QR codes for faster scanning
- Test on mobile for best camera experience
- Check browser console for errors

## 📞 Support

Check the console for detailed error messages:
- Browser: F12 → Console
- Backend: Terminal output

---

**Built with ❤️ using Django & React**
