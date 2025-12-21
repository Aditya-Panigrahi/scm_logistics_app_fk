# SCM Logistics App

A full-stack logistics management application built with Django and React.

## Features

### Home/Landing Page
- **Christmas-themed welcome**: Animated snowflakes and festive greeting
- **App navigation cards**: Square tiles for easy access to different modules
- **Responsive design**: Works beautifully on desktop and mobile
- **Smooth animations**: Professional fade-in and floating effects

### Inbound Process
- **Manual Entry**: Type Bin ID and Package Tracking ID
- **Camera Scanning**: Scan QR codes and barcodes using device camera
  - Supports QR codes, EAN-13, Code 128, and more
  - Real-time scanning with visual feedback
- Automatic validation of Bin IDs and Tracking IDs
- Three-step workflow: Scan Bin → Scan Package → Assign
- Real-time status updates
- Audit logging for all actions
- **Flipkart-inspired UI**: Modern, clean design with Flipkart's color scheme

## Tech Stack

**Backend:**
- Django 6.0
- Django REST Framework
- SQLite Database
- Django CORS Headers

**Frontend:**
- React 18 with React Router for navigation
- Axios for API calls
- html5-qrcode for barcode/QR code scanning
- Flipkart-inspired UI design (blue #2874f0, orange #fb641b)
- Christmas-themed animations
- Roboto font family
- Modern responsive design

## Project Structure

```
scm_logistics_app_fk/
├── backend/              # Django settings
├── inbound/             # Inbound process app
│   ├── models.py        # Bin, Shipment, AuditLog models
│   ├── serializers.py   # DRF serializers
│   ├── views.py         # API viewsets
│   └── urls.py          # API routes
├── frontend/            # React application
│   └── src/
│       │   ├── Home.js           # Landing page
│       │   ├── InboundProcess.js # Inbound app
│       │   └── BarcodeScanner.js # Camera scanner
│       ├── components/  # React components
│       └── services/    # API service layer
└── manage.py
```

## Setup Instructions

### Backend Setup

1. Install Python dependencies:
```bash
pipInstall frontend dependencies:
```bash
cd frontend
npm install
```

3.  install django djangorestframework django-cors-headers
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

3. Seed sample data:
```bash
python manage.py seed_data
```

5. Start Django development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start React development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## API Endpoints

### Inbound Process
- `POST /api/inbound/scan_bin/` - Validate bin ID
- `POST /api/inbound/scan_package/` - Validate tracking ID
- `POST /api/inbound/assign/` - Assign package to bin

### Data Management
- `GET /api/bins/` - List all bins
- `GET /api/shipments/` - List all shipments
- `GET /api/audit-logs/` - List audit logs
Navigation
1. Open http://localhost:3000 - You'll see the Christmas-themed landing page
2. Click on the **"Inbound Process"** card to access the inbound workflow
3. Use the back button to return to the home page

### 
## Usage

### Inbound Process Flow

1. **Scan Bin**: 
   - Enter bin ID manually (e.g., BIN-A001) OR
   - Click "📷 Scan" button to use camera
   - System validates bin availability
   
2. **Scan Package**: 
   - Enter tracking ID manually (e.g., PKG-12345) OR
   - Click "📷 Scan" button to use camera
   - System validates tracking ID is unique
   
3. **Assign**: 
   - Review bin and tracking information
   - Click "Assign Package" to complete

The system will:
- Create a shipment record
- Set status to "Unregistered"
- Record entry time
- Update bin status to "Occupied"
- Create an audit log entry

## Database Models

### Bin
- `bin_id` (Primary Key)
- `location`
- `capacity`
- `status` (available/occupied/maintenance)

### Shipment
- `tracking_id` (Primary Key)
- `bin` (Foreign Key)
- `status` (unregistered/registered/dispatched/delivered)
- `Camera Scanner

The app includes a built-in barcode and QR code scanner:

### Supported Formats:
- QR Codes
- EAN-13, EAN-8
- Code 128, Code 39
- UPC-A, UPC-E
- ITF and more

### Usage:
1. Click the camera icon button next to any input field
2. Allow camera permissions when prompted
3. Position the barcode/QR code within the frame
4. Scanner will automatically detect and fill the input
User authentication and authorization
- Advanced reporting and analytics
- Multi-warehouse support
- Mobile app version
- Batch scanning operation
## time_in`
- `time_out`

### AuditLog
- `action`
- `shipment` (Foreign Key)
- `user`
- `timestamp`
- `details`

## Sample Bins

The seed_data command creates the following sample bins:
- BIN-A001, BIN-A002, BIN-A003 (Warehouse A)
- BIN-B001, BIN-B002, BIN-B003 (Warehouse B)
- BIN-C001, BIN-C002 (Warehouse C)

## Development Notes

- Django runs on port 8000
- React runs on port 3000
- CORS is configured for local development
- SQLite database for easy setup and testing

## Future Enhancements

- Camera/barcode scanner integration
- User authentication
- Advanced reporting and analytics
- Part 2: Outbound Process
- Part 3: Inventory Management

## License

MIT
