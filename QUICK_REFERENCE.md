# Quick Reference Guide - SCM Logistics App

## 🚀 Quick Start

### Start Backend
```bash
python manage.py runserver
```
Backend runs at: http://localhost:8000

### Start Frontend
```bash
cd frontend
npm start
```
Frontend runs at: http://localhost:3000

## 🎄 Landing Page Features

### Christmas Animation
- ❄️ Animated snowflakes
- 🎄 Bouncing Christmas tree
- 🎅 Festive welcome message
- ✨ Smooth fade-in effects

### App Cards
1. **Inbound Process** (Active) - Click to access
2. **Outbound Process** (Coming Soon)
3. **Inventory Management** (Coming Soon)

## 📱 Camera Scanner Quick Tips

### First Time Setup
1. Browser will ask for camera permission
2. Click "Allow" when prompted
3. Scanner is now ready to use!

### How to Scan
1. Click the 📷 camera icon
2. Position barcode/QR code in the frame
3. Wait for automatic detection
4. Input field fills automatically

### Supported Codes
✅ QR Codes
✅ Barcodes (EAN, UPC, Code 128, etc.)

## 🎨 Design Elements

### Colors
- **Blue** (#2874f0) - Flipkart primary
- **Orange** (#fb641b) - Action buttons
- **Yellow** (#ffe11b) - Accents
- **Gray** (#f1f3f6) - Background

### Fonts
- Roboto (Google Font)
- Clean, modern typography

## 🔧 Test Data

### Sample Bin IDs
- BIN-A001, BIN-A002, BIN-A003
- BIN-B001, BIN-B002, BIN-B003
- BIN-C001, BIN-C002

### Sample Tracking IDs
- Use any format: PKG-12345, TRK-ABC123, etc.

## 📋 Workflow Steps

### From Home Page:
1. Click "Inbound Process" card
2. You'll be taken to the inbound workflow

### In Inbound Process:
1️⃣ **Scan Bin**
   - Manual OR Camera
   - Click "Validate Bin"

2️⃣ **Scan Package**
   - Manual OR Camera
   - Click "Validate Package"

3️⃣ **Assign**
   - Review information
   - Click "Assign Package"

4️⃣ **Return Home**
   - Click "← Back" button in header

## 🔍 API Endpoints

```
POST /api/inbound/scan_bin/
POST /api/inbound/scan_package/
POST /api/inbound/assign/
GET  /api/bins/
GET  /api/shipments/
GET  /api/audit-logs/
```

## 🛠️ Troubleshooting

### Camera Not Working?
- Check browser permissions
- Use Chrome (recommended)
- Ensure good lighting
- Try localhost instead of IP

### Backend Not Responding?
```bash
python manage.py runserver
```

### Frontend Not Loading?
```bash
cd frontend
npm install
npm start
```

## 📊 View Admin Panel

1. Create superuser (first time only):
```bash
python manage.py createsuperuser
```

2. Visit: http://localhost:8000/admin

## 🔐 Security Notes

- Current settings are for DEVELOPMENT only
- Change SECRET_KEY before production
- Update CORS_ALLOWED_ORIGINS
- Set DEBUG=False in production
- Use PostgreSQL instead of SQLite

## 📱 Mobile Testing

Access from phone: http://192.168.1.32:3000

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement Outbound Process
- [ ] Add Inventory Management
- [ ] Deploy to production
- [ ] Add email notifications

## 📚 Documentation

- [README.md](README.md) - Full documentation
- [CAMERA_TESTING.md](CAMERA_TESTING.md) - Scanner testing guide
- [DESIGN_GUIDE.md](DESIGN_GUIDE.md) - Design system details

## 🐛 Common Issues

**Issue**: Camera permission denied
**Solution**: Reset permissions in browser settings

**Issue**: Package already exists
**Solution**: Use a unique tracking ID

**Issue**: Bin not available
**Solution**: Check bin status in admin panel

**Issue**: CORS errors
**Solution**: Ensure both servers are running

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

**Happy Scanning! 📦🚀**
