# Ekart Logistics - Warehouse Management System

A full-stack warehouse logistics management application built with Django REST Framework (Backend) and React (Frontend).

## 🎯 Overview

This warehouse management system provides complete package lifecycle management from receiving to dispatch, featuring:

- **Inbound Process**: Receive packages and assign to storage bins
- **Manifest Creation**: Bulk import shipments via CSV/JSON files
- **Outbound Process**: 
  - Bin-based pickup with verification
  - File-based picklist processing
- **Inventory Dashboard**: Real-time warehouse analytics and status monitoring

## ✨ Key Features

### 📦 Inbound Process
- Two-step workflow: Scan bin → Scan package
- Auto-validation and bin locking
- Real-time capacity tracking
- Barcode scanner integration
- Package assignment with audit trails

### 📋 Manifest Creation
- CSV/JSON file upload support
- Bulk package registration
- Automatic status updates
- Success/failure reporting

### 🚚 Outbound Process
- **Bin Pickup**: Load all packages from a bin, verify each pickup
- **File Pickup**: Upload tracking ID list, create picklist, dispatch individually
- Package verification with scanning
- Automatic bin freeing
- Dispatch confirmation

### 📊 Inventory Dashboard
- **Overview**: Warehouse capacity, utilization, status distribution
- **Bins View**: Real-time bin status, package counts, utilization bars
- **Packages View**: Complete shipment list with filters and search

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                React Frontend (Port 3000)                │
│  - Component-based UI                                    │
│  - Axios API integration                                 │
│  - React Router navigation                               │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────┴──────────────────────────────────┐
│              Django Backend (Port 8000)                  │
│  - REST API endpoints (DRF)                              │
│  - Business logic & validations                          │
│  - SQLite database                                       │
└─────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

```
scm_logistics_app_fk/
├── backend/                    # Django configuration
│   ├── settings.py            # App settings, CORS, database
│   └── urls.py                # Root URL routing
├── inbound/                    # Main Django app
│   ├── models.py              # Bin, Shipment, AuditLog models
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API ViewSets
│   ├── urls.py                # API routes
│   └── management/commands/   # Management commands
│       └── seed_data.py       # Database seeding
├── frontend/
│   ├── public/                # Static assets
│   └── src/
│       ├── components/        # React components
│       │   ├── Home.js
│       │   ├── InboundProcess.js
│       │   ├── OutboundProcess.js
│       │   ├── ManifestCreation.js
│       │   ├── InventoryDashboard.js
│       │   └── BarcodeScanner.js
│       └── services/
│           └── api.js         # Axios API service
├── manage.py
├── requirements.txt           # Python dependencies
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Clone the repository and navigate to project:**
```bash
cd scm_logistics_app_fk
```

2. **Create and activate virtual environment:**
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Seed sample data (optional):**
```bash
python manage.py seed_data
```

6. **Start Django server:**
```bash
python manage.py runserver
```
Backend runs at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start React development server:**
```bash
npm start
```
Frontend runs at `http://localhost:3000`

## 💾 Database Models

### Bin
- `bin_id` (Primary Key) - Unique bin identifier
- `location` - Physical warehouse location
- `capacity` - Maximum packages
- `status` - available/occupied/maintenance

### Shipment
- `tracking_id` (Primary Key) - Unique tracking number
- `bin` (Foreign Key) - Associated bin
- `status` - manifested/putaway/picklist-created/picked/dispatched
- `manifested` - Boolean flag
- `time_in`, `time_out` - Timestamps

### AuditLog
- Tracks all package operations
- Records user, action, timestamp, details

## 🔌 API Endpoints

### Inbound
- `POST /api/inbound/scan_bin/` - Validate bin
- `POST /api/inbound/assign/` - Assign package to bin

### Outbound
- `POST /api/outbound/get_bin_packages/` - Get all packages in bin
- `POST /api/outbound/pickup_package/` - Mark package as picked
- `POST /api/outbound/dispatch_packages/` - Dispatch picked packages
- `POST /api/outbound/process_picklist_file/` - Process CSV/JSON file
- `POST /api/outbound/dispatch_single_package/` - Dispatch individual package

### Data
- `GET /api/bins/` - List all bins
- `GET /api/shipments/` - List all shipments
- `GET /api/audit-logs/` - View audit logs

### Manifest
- `POST /api/inbound/upload_manifest/` - Bulk create shipments

## 🎨 UI Features

- **Ekart Branding**: Consistent blue theme with official logo
- **Responsive Design**: Works on desktop and tablets
- **Scanner Integration**: Built-in barcode/QR code scanning
- **Real-time Updates**: Live status changes and validations
- **Tab Navigation**: Clean, organized multi-view interfaces

## 🔧 Configuration

### CORS Settings
Configure in `backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### API Base URL
Configure in `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## 📱 Scanner Support

Built-in barcode scanner supports:
- QR Codes
- EAN-13, EAN-8
- Code 128, Code 39
- UPC-A, UPC-E
- And more...

## 🛠️ Development Commands

```bash
# Backend
python manage.py makemigrations     # Create migrations
python manage.py migrate            # Apply migrations
python manage.py seed_data          # Seed sample bins
python manage.py createsuperuser    # Create admin user
python manage.py runserver          # Start server

# Frontend
npm start                           # Development server
npm run build                       # Production build
npm test                            # Run tests
```

## 🔍 Troubleshooting

### CORS Errors
- Verify `django-cors-headers` is installed
- Check `CORS_ALLOWED_ORIGINS` in settings
- Restart Django server

### Connection Issues
- Ensure Django runs on port 8000
- Verify React runs on port 3000
- Check firewall settings

### Camera Scanner
- Use HTTPS or localhost
- Grant camera permissions
- Check browser compatibility

## 📚 Tech Stack

**Backend:**
- Django 6.0
- Django REST Framework
- SQLite

**Frontend:**
- React 18
- React Router
- Axios
- html5-qrcode

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use for learning and development.

---

Built with ❤️ using Django and React

---

## 🔄 How Django and React Work Together

### The Separation

**Django = Backend (Server)**
- Stores data in database (SQLite)
- Provides REST APIs (JSON endpoints)
- Handles business logic
- Runs on `http://localhost:8000`

**React = Frontend (Client)**
- User interface (what you see in browser)
- Sends HTTP requests to Django APIs
- Displays data beautifully
- Runs on `http://localhost:3000`

### The Communication Flow

```
User clicks button in React
    ↓
React sends HTTP request (via Axios) to Django API
    ↓
Django processes request, queries database
    ↓
Django sends JSON response back
    ↓
React receives response and updates UI
```

**Real Example:**
```javascript
// React (Frontend) - InboundProcess.js
const response = await api.post('/inbound/scan_bin/', {
    bin_id: 'BIN-A001'
});

// Django (Backend) - views.py
@action(detail=False, methods=['post'])
def scan_bin(self, request):
    bin_id = request.data['bin_id']
    bin_obj = Bin.objects.get(bin_id=bin_id)
    return Response({'success': True, 'bin': bin_obj})
```

### Why This Architecture?

1. **Separation of Concerns**: Frontend handles UI, Backend handles data
2. **Scalability**: Can deploy frontend and backend separately
3. **Flexibility**: Can build mobile app using same Django APIs
4. **Modern**: Industry-standard approach (used by Netflix, Airbnb, etc.)

---

## 🏗️ Architecture & Data Flow

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         React Frontend (Port 3000)              │   │
│  │  - Components (Home, Inbound, Outbound, etc.)  │   │
│  │  - Axios API calls                              │   │
│  │  - Routing (React Router)                       │   │
│  └──────────────────┬──────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────┘
                      │ HTTP Requests/Responses
                      │ (JSON data)
┌─────────────────────┼──────────────────────────────────┐
│                     ▼                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │      Django Backend (Port 8000)                 │   │
│  │  - REST API Endpoints                           │   │
│  │  - ViewSets (Business Logic)                    │   │
│  │  - Serializers (Data Validation)                │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────────┐   │
│  │          SQLite Database                        │   │
│  │  - Bins Table                                   │   │
│  │  - Shipments Table                              │   │
│  │  - AuditLogs Table                              │   │
│  └─────────────────────────────────────────────────┘   │
│                    SERVER                                │
└─────────────────────────────────────────────────────────┘
```

### Database Models

**1. Bin (Storage Container)**
```python
bin_id: "BIN-A001" (Primary Key)
location: "Warehouse A - Row 1"
capacity: 1
status: "available" / "occupied" / "maintenance"
created_at, updated_at
```

**2. Shipment (Package)**
```python
tracking_id: "PKG-0001" (Primary Key)
bin: Foreign Key to Bin
status: "unregistered" / "registered" / "picked-up" / "dispatched" / "delivered"
time_in: When package entered warehouse
time_out: When package was picked up
time_registered: When status updated to registered
created_at, updated_at
```

**3. AuditLog (Action History)**
```python
action: "assigned" / "updated" / "dissociated" / "dispatched" / "delivered"
shipment: Foreign Key to Shipment
user: Who performed the action
timestamp: When it happened
details: Description of action
```

### API Communication Pattern

**CORS (Cross-Origin Resource Sharing):**
- React runs on port 3000
- Django runs on port 8000
- Django has `django-cors-headers` configured to allow requests from port 3000
- Without CORS, browser would block the requests

**Request Flow:**
1. User interacts with React UI
2. React component calls API function from `services/api.js`
3. Axios sends HTTP request to Django endpoint
4. Django view receives request, processes it
5. Django queries/updates database
6. Django serializes response to JSON
7. Axios receives JSON response
8. React updates UI based on response

---

## 🎨 Features Explained

### 1. Home/Landing Page

**What it does:** Welcome page with app navigation

**Components:**
- Christmas-themed design with animated snowflakes
- Four app cards: Inbound, Status Reconciliation, Outbound, Other Apps
- Flipkart branding (logo, colors)

**How it works:**
- `Home.js` - React component rendering the page
- `Home.css` - Styling with animations
- `useNavigate()` hook from React Router for navigation
- Clicking active cards navigates to respective apps

### 2. Inbound Process

**What it does:** Receive packages and store them in bins

**Three-Step Workflow:**

**Step 1: Scan Bin**
- User enters/scans bin ID
- System checks if bin exists (creates if not)
- Validates bin is "available"
- Shows bin details

**Step 2: Scan Package**
- User enters/scans tracking ID  
- System validates tracking ID is unique
- Confirms package is ready for assignment

**Step 3: Assign**
- System links package to bin in database
- Updates bin status to "occupied"
- Changes shipment status to "unregistered"
- Creates audit log entry

**Camera Scanning:**
- Uses `html5-qrcode` library
- Opens camera modal
- Detects QR codes and barcodes
- Returns scanned value to input field

### 3. Status Reconciliation

**What it does:** Bulk update package status when delivery partner confirms receipt

**Workflow:**

1. **Upload Manifest**
   - User uploads CSV or JSON file
   - File contains list of tracking IDs

2. **Parse File**
   - React reads file content
   - Extracts tracking IDs
   - Sends array to Django API

3. **Bulk Update**
   - Django loops through tracking IDs
   - Finds each shipment in database
   - Updates status to "registered"
   - Records `time_registered`
   - Creates audit log for each

4. **Show Results**
   - Displays success/failure counts
   - Lists successfully updated IDs
   - Shows failed IDs with reasons

**Supported Formats:**
```csv
# CSV format
tracking_id
PKG-0001
PKG-0002
```

```json
// JSON format
["PKG-0001", "PKG-0002"]
// OR
[{"tracking_id": "PKG-0001"}, {"tracking_id": "PKG-0002"}]
```

### 4. Outbound Process

**What it does:** Find and retrieve packages for dispatch

**Three Tabs:**

**Tab 1: Search Package**
- Enter tracking ID
- System returns bin location
- Shows current status
- Helps operator locate package

**Tab 2: Bin Audit**
- Enter bin ID
- System shows all packages in that bin
- Displays package count and statuses
- Useful for verifying bin contents

**Tab 3: Pick Up Package**
- Enter tracking ID and bin ID
- System validates package is in specified bin
- Removes bin association (sets to null)
- Updates status to "picked-up"
- Records `time_out`
- Creates audit log
- Updates bin to "available" if empty

---

## 📂 Project Structure

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

---

## 📂 Project Structure

### Backend (Django)

```
scm_logistics_app_fk/
├── backend/
│   ├── settings.py          # Django configuration
│   │   - INSTALLED_APPS: rest_framework, corsheaders, inbound
│   │   - CORS_ALLOWED_ORIGINS: http://localhost:3000
│   │   - Database: SQLite configuration
│   └── urls.py              # Root URL routing
│       - Includes inbound app URLs at /api/
│
├── inbound/                 # Main Django app
│   ├── models.py            # Database models
│   │   - Bin: Storage container model
│   │   - Shipment: Package model
│   │   - AuditLog: Action tracking model
│   │
│   ├── serializers.py       # DRF Serializers (data validation)
│   │   - BinSerializer, ShipmentSerializer, AuditLogSerializer
│   │   - ScanBinSerializer, ScanPackageSerializer
│   │   - AssignPackageSerializer
│   │   - ManifestUploadSerializer
│   │   - SearchPackageSerializer, SearchBinSerializer
│   │   - DissociatePackageSerializer
│   │
│   ├── views.py             # API ViewSets (business logic)
│   │   - BinViewSet: CRUD operations for bins
│   │   - ShipmentViewSet: CRUD operations for shipments
│   │   - AuditLogViewSet: Read-only audit logs
│   │   - InboundProcessViewSet:
│   │       - scan_bin() action
│   │       - scan_package() action
│   │       - assign() action
│   │       - process_manifest() action
│   │   - OutboundProcessViewSet:
│   │       - search_package() action
│   │       - search_bin() action
│   │       - dissociate() action
│   │
│   ├── urls.py              # API routing
│   │   - Router registrations for all viewsets
│   │
│   ├── admin.py             # Django admin configuration
│   └── migrations/          # Database migrations
│
├── db.sqlite3               # SQLite database file
└── manage.py                # Django management script
```

### Frontend (React)

```
frontend/
├── public/
│   └── index.html           # HTML template
│
├── src/
│   ├── App.js               # Root component with routing
│   │   - BrowserRouter setup
│   │   - Routes: /, /inbound, /outbound, /status-reconciliation
│   │
│   ├── App.css              # Global styles
│   │
│   ├── components/          # React components
│   │   ├── Home.js          # Landing page component
│   │   │   - App navigation cards
│   │   │   - Christmas animations
│   │   │   - useNavigate for routing
│   │   │
│   │   ├── Home.css         # Landing page styles
│   │   │   - Snowflake animations
│   │   │   - Gradient backgrounds
│   │   │   - Card animations
│   │   │
│   │   ├── InboundProcess.js    # Inbound workflow component
│   │   │   - useState for form data
│   │   │   - Step-by-step workflow
│   │   │   - API calls to Django
│   │   │   - Scanner modal integration
│   │   │
│   │   ├── InboundProcess.css   # Inbound styles
│   │   │   - Flipkart color scheme
│   │   │   - Step indicators
│   │   │   - Success/error messages
│   │   │
│   │   ├── OutboundProcess.js   # Outbound workflow component
│   │   │   - Tab-based interface
│   │   │   - Search functionality
│   │   │   - Pickup operations
│   │   │
│   │   ├── OutboundProcess.css  # Outbound styles
│   │   │
│   │   ├── StatusReconciliation.js  # Manifest upload component
│   │   │   - File upload handling
│   │   │   - CSV/JSON parsing
│   │   │   - Results display
│   │   │
│   │   ├── StatusReconciliation.css  # Reconciliation styles
│   │   │
│   │   ├── BarcodeScanner.js    # Camera scanner component
│   │   │   - html5-qrcode integration
│   │   │   - Modal overlay
│   │   │   - Scan callback
│   │   │
│   │   └── BarcodeScanner.css   # Scanner styles
│   │
│   ├── services/
│   │   └── api.js           # Axios API service layer
│   │       - Base URL: http://localhost:8000/api
│   │       - Centralized API calls
│   │
│   └── index.js             # React entry point
│
├── package.json             # NPM dependencies
│   - react, react-router-dom
│   - axios (HTTP client)
│   - html5-qrcode (scanner)
│
└── .env                     # Environment variables
    - GENERATE_SOURCEMAP=false
```

---

## 🚀 Setup & Running

### Prerequisites

- Python 3.8+ installed
- Node.js 14+ and npm installed
- Git (optional, for cloning)

### Step 1: Backend Setup

1. **Navigate to project root:**
```bash
cd scm_logistics_app_fk
```

2. **Create virtual environment:**
```bash
python -m venv .venv
```

3. **Activate virtual environment:**
```bash
# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate
```

4. **Install Python dependencies:**
```bash
pip install django djangorestframework django-cors-headers
```

5. **Run database migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create sample data (optional but recommended):**
```python
# Run Django shell
python manage.py shell

# Paste this code:
from inbound.models import Bin

bins_data = [
    ('BIN-A001', 'Warehouse A - Row 1'),
    ('BIN-A002', 'Warehouse A - Row 1'),
    ('BIN-A003', 'Warehouse A - Row 2'),
    ('BIN-B001', 'Warehouse B - Row 1'),
    ('BIN-B002', 'Warehouse B - Row 1'),
    ('BIN-B003', 'Warehouse B - Row 2'),
    ('BIN-C001', 'Warehouse C - Row 1'),
    ('BIN-C002', 'Warehouse C - Row 1'),
]

for bin_id, location in bins_data:
    Bin.objects.get_or_create(bin_id=bin_id, defaults={'location': location, 'capacity': 1})

print("Sample bins created!")
exit()
```

7. **Start Django server:**
```bash
python manage.py runserver
```

Backend is now running at `http://localhost:8000`

### Step 2: Frontend Setup

1. **Open new terminal, navigate to frontend:**
```bash
cd frontend
```

2. **Install npm dependencies:**
```bash
npm install
```

3. **Start React development server:**
```bash
npm start
```

Frontend will automatically open at `http://localhost:3000`

### Verification

- Open browser to `http://localhost:3000`
- You should see the Christmas-themed landing page
- Click on "Inbound Process" to test the app
- Check Django admin at `http://localhost:8000/admin` (create superuser first with `python manage.py createsuperuser`)

---

## 🔄 End-to-End Feature Flows

### Flow 1: Inbound Process (Complete Package Assignment)

**Scenario:** A package arrives at the warehouse and needs to be stored.

**Step-by-Step:**

1. **User Action:** Opens `http://localhost:3000`, clicks "Inbound Process"
   - **React:** `Home.js` renders, user clicks card
   - **React Router:** Navigates to `/inbound`
   - **React:** `InboundProcess.js` component loads

2. **User Action:** Enters "BIN-A001" and clicks "Scan Bin"
   - **React:** `handleScanBin()` function called
   - **Axios:** `POST http://localhost:8000/api/inbound/scan_bin/`
   - **Request Body:** `{ bin_id: "BIN-A001" }`

3. **Django Processing:**
   ```python
   # views.py - InboundProcessViewSet.scan_bin()
   serializer = ScanBinSerializer(data=request.data)
   serializer.is_valid()  # Validates bin_id
   
   bin_obj, created = Bin.objects.get_or_create(
       bin_id="BIN-A001",
       defaults={'location': 'Auto-created', 'capacity': 1}
   )
   
   if bin_obj.status != 'available':
       return error response
   
   return Response({
       'success': True,
       'bin': BinSerializer(bin_obj).data
   })
   ```

4. **React Response:** Displays success message, enables next step

5. **User Action:** Enters "PKG-0001" and clicks "Scan Package"
   - **Axios:** `POST http://localhost:8000/api/inbound/scan_package/`
   - **Request Body:** `{ tracking_id: "PKG-0001" }`

6. **Django Processing:**
   ```python
   # views.py - InboundProcessViewSet.scan_package()
   serializer = ScanPackageSerializer(data=request.data)
   
   # Validates tracking_id doesn't already exist
   if Shipment.objects.filter(tracking_id=value).exists():
       raise ValidationError("Already exists")
   
   return Response({
       'success': True,
       'tracking_id': "PKG-0001"
   })
   ```

7. **React Response:** Shows success, enables assign button

8. **User Action:** Clicks "Assign Package to Bin"
   - **Axios:** `POST http://localhost:8000/api/inbound/assign/`
   - **Request Body:** `{ bin_id: "BIN-A001", tracking_id: "PKG-0001" }`

9. **Django Processing:**
   ```python
   # views.py - InboundProcessViewSet.assign()
   bin_obj = Bin.objects.get(bin_id="BIN-A001")
   
   # Create shipment
   shipment = Shipment.objects.create(
       tracking_id="PKG-0001",
       bin=bin_obj,
       status='unregistered',
       time_in=timezone.now()
   )
   
   # Update bin
   bin_obj.status = 'occupied'
   bin_obj.save()
   
   # Create audit log
   AuditLog.objects.create(
       action='assigned',
       shipment=shipment,
       user='anonymous',
       details='Package PKG-0001 assigned to bin BIN-A001'
   )
   
   return Response({'success': True, 'shipment': {...}})
   ```

10. **Database State After:**
    ```sql
    -- bins table
    bin_id     | location           | status   
    BIN-A001   | Warehouse A - Row 1| occupied 
    
    -- shipments table
    tracking_id | bin_id   | status        | time_in
    PKG-0001    | BIN-A001 | unregistered  | 2025-12-21 10:30:00
    
    -- auditlog table
    action    | shipment  | user      | details
    assigned  | PKG-0001  | anonymous | Package PKG-0001 assigned...
    ```

11. **React Response:** Shows success modal, resets form

---

### Flow 2: Status Reconciliation (Bulk Status Update)

**Scenario:** Delivery partner confirms they received 100 packages. You need to update all their statuses to "registered".

**Step-by-Step:**

1. **Preparation:** Create CSV file `manifest.csv`
   ```csv
   tracking_id
   PKG-0001
   PKG-0002
   PKG-0003
   ```

2. **User Action:** Opens Status Reconciliation page, clicks "Choose File"
   - **React:** `StatusReconciliation.js` loads
   - **Browser:** File input opens
   - **User:** Selects `manifest.csv`

3. **React Processing:**
   ```javascript
   const handleFileSelect = (event) => {
       const file = event.target.files[0];
       setSelectedFile(file);  // Store file in state
   }
   ```

4. **User Action:** Clicks "Upload & Process"
   - **React:** `handleUpload()` function called
   
5. **React File Parsing:**
   ```javascript
   const fileContent = await selectedFile.text();
   const lines = fileContent.split('\n');
   const trackingIds = lines.slice(1).map(line => line.trim());
   // Result: ["PKG-0001", "PKG-0002", "PKG-0003"]
   ```

6. **Axios Request:**
   - **POST:** `http://localhost:8000/api/inbound/process_manifest/`
   - **Body:** `{ tracking_ids: ["PKG-0001", "PKG-0002", "PKG-0003"] }`

7. **Django Processing:**
   ```python
   # views.py - InboundProcessViewSet.process_manifest()
   tracking_ids = request.data['tracking_ids']
   updated_ids = []
   failed_ids = []
   
   for tracking_id in tracking_ids:
       try:
           shipment = Shipment.objects.get(tracking_id=tracking_id)
           
           if shipment.status == 'registered':
               failed_ids.append({'tracking_id': tracking_id, 'reason': 'Already registered'})
               continue
           
           shipment.status = 'registered'
           shipment.time_registered = timezone.now()
           shipment.save()
           
           AuditLog.objects.create(
               action='updated',
               shipment=shipment,
               details='Status updated to registered via manifest'
           )
           
           updated_ids.append(tracking_id)
       except Shipment.DoesNotExist:
           failed_ids.append({'tracking_id': tracking_id, 'reason': 'Not found'})
   
   return Response({
       'updated_count': len(updated_ids),
       'failed_count': len(failed_ids),
       'updated_ids': updated_ids,
       'failed_ids': failed_ids
   })
   ```

8. **Database State:**
   ```sql
   -- shipments table (updated)
   tracking_id | status     | time_registered
   PKG-0001    | registered | 2025-12-21 11:00:00
   PKG-0002    | registered | 2025-12-21 11:00:00
   PKG-0003    | registered | 2025-12-21 11:00:00
   ```

9. **React Response:** Displays results
   - ✅ Updated: 3
   - ❌ Failed: 0
   - Shows list of tracking IDs

---

### Flow 3: Outbound Process (Package Pickup)

**Scenario:** Need to retrieve PKG-0001 for dispatch.

**Tab 1: Search Package (Find Location)**

1. **User Action:** Opens Outbound, enters "PKG-0001" in Search Package tab
   - **Axios:** `POST /api/outbound/search_package/`
   - **Body:** `{ tracking_id: "PKG-0001" }`

2. **Django Processing:**
   ```python
   shipment = Shipment.objects.select_related('bin').get(tracking_id="PKG-0001")
   return Response({
       'package': {
           'tracking_id': "PKG-0001",
           'status': "registered",
           'bin': {
               'bin_id': "BIN-A001",
               'location': "Warehouse A - Row 1"
           }
       }
   })
   ```

3. **React Display:** Shows "📍 Bin Location: BIN-A001"

**Tab 3: Pick Up Package (Dissociate)**

4. **User Action:** Switches to "Pick Up Package" tab
   - Enters "PKG-0001" for tracking ID
   - Enters "BIN-A001" for bin ID
   - Clicks "Pick Up Package"

5. **Axios Request:**
   - **POST:** `/api/outbound/dissociate/`
   - **Body:** `{ tracking_id: "PKG-0001", bin_id: "BIN-A001" }`

6. **Django Validation:**
   ```python
   # serializers.py - DissociatePackageSerializer.validate()
   shipment = Shipment.objects.get(tracking_id="PKG-0001")
   
   if not shipment.bin or shipment.bin.bin_id != "BIN-A001":
       raise ValidationError("Package not in this bin")
   
   if shipment.status == 'picked-up':
       raise ValidationError("Already picked up")
   ```

7. **Django Processing:**
   ```python
   # views.py - OutboundProcessViewSet.dissociate()
   shipment = Shipment.objects.get(tracking_id="PKG-0001")
   bin_obj = shipment.bin
   
   # Dissociate
   shipment.bin = None
   shipment.status = 'picked-up'
   shipment.time_out = timezone.now()
   shipment.save()
   
   # Check if bin is now empty
   remaining = Shipment.objects.filter(bin=bin_obj).count()
   if remaining == 0:
       bin_obj.status = 'available'
       bin_obj.save()
   
   AuditLog.objects.create(
       action='dissociated',
       shipment=shipment,
       details='Package PKG-0001 picked up from bin BIN-A001'
   )
   ```

8. **Database State:**
   ```sql
   -- shipments table
   tracking_id | bin_id | status    | time_out
   PKG-0001    | NULL   | picked-up | 2025-12-21 12:00:00
   
   -- bins table
   bin_id    | status
   BIN-A001  | available  (if no more packages)
   ```

9. **React Response:** Success message, reset form

---

## 🛠️ Tech Stack Details

### Backend Technologies

**Django 6.0:**
- Python web framework
- Provides ORM (Object-Relational Mapping) for database
- Admin interface for data management
- URL routing and view handling

**Django REST Framework (DRF):**
- Turns Django into REST API server
- Provides `ViewSets` for CRUD operations
- `Serializers` for data validation and JSON conversion
- Automatic API documentation

**SQLite:**
- File-based database (db.sqlite3)
- No separate server needed
- Good for development and small deployments

**django-cors-headers:**
- Allows React (port 3000) to call Django (port 8000)
- Configures CORS headers in responses

### Frontend Technologies

**React 18:**
- JavaScript library for building UIs
- Component-based architecture
- Virtual DOM for performance
- Hooks (useState, useEffect, useNavigate)

**React Router:**
- Client-side routing
- Navigation between pages without page reload
- `<BrowserRouter>`, `<Routes>`, `<Route>` components

**Axios:**
- HTTP client for API calls
- Promise-based
- Automatic JSON parsing
- Request/response interceptors

**html5-qrcode:**
- Camera access and barcode scanning
- Supports multiple formats (QR, EAN, Code 128)
- Real-time detection

### Design System

**Flipkart Colors:**
- Primary Blue: `#2874f0`
- Orange: `#fb641b`
- Yellow: `#ffe11b`
- Green: `#4caf50`

**Font:** Roboto (Google Font)

**UI Patterns:**
- Card-based layouts
- Modal overlays
- Tab interfaces
- Step indicators
- Status badges
- Floating animations

---

## 📱 API Endpoints Reference

### Inbound APIs

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|--------------|----------|-------------|
| POST | `/api/inbound/scan_bin/` | `{bin_id: string}` | `{success, bin}` | Validate bin |
| POST | `/api/inbound/scan_package/` | `{tracking_id: string}` | `{success, tracking_id}` | Validate package |
| POST | `/api/inbound/assign/` | `{bin_id, tracking_id}` | `{success, shipment}` | Assign package to bin |
| POST | `/api/inbound/process_manifest/` | `{tracking_ids: array}` | `{updated_count, failed_count, ...}` | Bulk status update |

### Outbound APIs

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|--------------|----------|-------------|
| POST | `/api/outbound/search_package/` | `{tracking_id: string}` | `{success, package}` | Find package location |
| POST | `/api/outbound/search_bin/` | `{bin_id: string}` | `{success, bin, packages}` | List bin contents |
| POST | `/api/outbound/dissociate/` | `{tracking_id, bin_id}` | `{success, package}` | Pick up package |

### Data Management APIs

| Method | Endpoint | Response | Description |
|--------|----------|----------|-------------|
| GET | `/api/bins/` | `[{bin_id, location, ...}]` | List all bins |
| GET | `/api/shipments/` | `[{tracking_id, bin, ...}]` | List all shipments |
| GET | `/api/audit-logs/` | `[{action, shipment, ...}]` | List audit logs |

---

## 💡 Key Concepts for Django Developers Learning React

### 1. Components = Reusable Pieces

**Django Template:**
```html
{% include 'header.html' %}
<div class="content">
    {{ content }}
</div>
```

**React Equivalent:**
```javascript
function App() {
    return (
        <div>
            <Header />
            <Content data={content} />
        </div>
    );
}
```

### 2. State = Data That Changes

**Django View:**
```python
def view(request):
    context = {'count': 0}
    return render(request, 'template.html', context)
```

**React Equivalent:**
```javascript
function Component() {
    const [count, setCount] = useState(0);
    
    return <div>Count: {count}</div>;
}
```

### 3. Props = Passing Data

**Django Template:**
```html
{% include 'button.html' with text='Click Me' %}
```

**React Equivalent:**
```javascript
<Button text="Click Me" />
```

### 4. useEffect = componentDidMount

**Django:** Runs on page load (in view)

**React:**
```javascript
useEffect(() => {
    // Runs when component loads
    fetchData();
}, []);  // Empty array = run once
```

### 5. Axios = requests library

**Django:**
```python
import requests
response = requests.post(url, json=data)
```

**React:**
```javascript
import axios from 'axios';
const response = await axios.post(url, data);
```

---

## 🎓 Learning Path

If you're new to React, here's how to understand this project:

1. **Start with Home.js:**
   - Simple component with navigation
   - No complex state management
   - Good intro to JSX and props

2. **Move to InboundProcess.js:**
   - See useState for form data
   - Understand event handlers (onChange, onClick)
   - Learn API calls with Axios

3. **Study api.js:**
   - See how Axios is configured
   - Base URL setup
   - API call patterns

4. **Explore BarcodeScanner.js:**
   - Modal component pattern
   - useEffect for initialization/cleanup
   - Callback props

5. **Read OutboundProcess.js:**
   - Tab-based interface
   - Multiple states
   - Conditional rendering

6. **Finally, StatusReconciliation.js:**
   - File handling
   - Complex data parsing
   - Results display logic

---

## 🔍 Troubleshooting

### Issue: CORS errors

**Symptom:** Browser console shows "CORS policy" error

**Solution:**
- Verify `django-cors-headers` is installed
- Check `CORS_ALLOWED_ORIGINS` in `backend/settings.py` includes `http://localhost:3000`
- Restart Django server

### Issue: Connection refused

**Symptom:** `ERR_CONNECTION_REFUSED` in React

**Solution:**
- Verify Django is running on port 8000
- Check `api.js` has correct base URL
- Verify no firewall blocking

### Issue: 404 Not Found on API calls

**Symptom:** API returns 404

**Solution:**
- Check `inbound/urls.py` router registrations
- Verify `backend/urls.py` includes inbound URLs
- Check endpoint URL in React matches Django route

### Issue: Camera not working

**Symptom:** Scanner fails to open camera

**Solution:**
- Ensure HTTPS or localhost (browsers require secure context)
- Grant camera permissions
- Check browser compatibility
- Verify `html5-qrcode` is installed

---

## 📚 Additional Resources

- **Django REST Framework:** https://www.django-rest-framework.org/
- **React Documentation:** https://react.dev/
- **Axios Documentation:** https://axios-http.com/
- **React Router:** https://reactrouter.com/
- **html5-qrcode:** https://github.com/mebjas/html5-qrcode

---

## 🤝 Contributing

This project is built for learning. Feel free to:
- Add new features
- Improve UI/UX
- Optimize code
- Add tests
- Enhance documentation

---

## 📄 License

This project is for educational purposes.

---

**Happy Coding! 🚀**
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
