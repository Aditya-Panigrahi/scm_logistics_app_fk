# Ekart Logistics - Warehouse Management System

Full-stack warehouse logistics application for package lifecycle management from receiving to dispatch.

**Stack:** Django REST Framework + React + SQLite

> 📖 **Quick Start?** See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for installation and startup instructions.

## Overview

Complete warehouse management solution featuring automated package tracking, bin management, and real-time inventory monitoring. Built with modern web technologies for scalability and ease of use.

## Features

### 📦 Inbound Process
Receive and store incoming packages efficiently:
- **Two-step assignment workflow**: Scan bin → Scan package → Assign
- **Camera/barcode scanner integration** for hands-free operation
- **Real-time bin capacity tracking** prevents overfilling
- **Auto-validation** ensures data integrity
- **Complete audit trails** for all operations

### 📋 Manifest Creation
Bulk shipment registration for high-volume operations:
- **CSV/JSON file upload** for batch processing
- **Automatic status reconciliation** with delivery partners
- **Detailed success/failure reports** for tracking
- **Bulk status updates** for hundreds of packages at once

### 🚚 Outbound Process
Efficient package retrieval and dispatch:
- **Package location search** - quickly find any package
- **Bin audit capability** - verify bin contents
- **Pickup verification workflow** - scan to confirm
- **Automatic bin release** when empty
- **File-based picklist processing** for batch operations

### 📊 Inventory Dashboard
Real-time warehouse analytics and monitoring:
- **Warehouse capacity metrics** - utilization, available space
- **Bin status visualization** - occupied/available/maintenance
- **Package status distribution** - track shipment lifecycle
- **Live updates** without page refresh
- **Advanced filters and search** for quick access

## Architecture

### System Design

```
┌──────────────────────────────────────────────┐
│           React Frontend (Port 3000)         │
│  - Component-based UI                        │
│  - Real-time updates                         │
│  - Responsive design                         │
└──────────────────┬───────────────────────────┘
                   │ REST API (JSON)
┌──────────────────┴───────────────────────────┐
│        Django Backend (Port 8000)            │
│  - Business logic & validation               │
│  - RESTful API endpoints                     │
│  - Database operations                       │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────┴───────────────────────────┐
│            SQLite Database                   │
│  - Bins, Shipments, AuditLogs                │
└──────────────────────────────────────────────┘
```

## Project Structure

```
scm_logistics_app_fk/
├── backend/                # Django configuration
│   ├── settings.py        # CORS, database, installed apps
│   ├── urls.py            # Root URL routing
│   ├── wsgi.py            # WSGI server config
│   └── asgi.py            # ASGI server config
│
├── inbound/               # Main Django app
│   ├── models.py          # Database models (Bin, Shipment, AuditLog)
│   ├── serializers.py     # DRF serializers for validation
│   ├── views.py           # API ViewSets with business logic
│   ├── urls.py            # API endpoint routing
│   ├── admin.py           # Django admin configuration
│   └── management/
│       └── commands/
│           └── seed_data.py  # Database seeding script
│
├── frontend/
│   ├── public/
│   │   └── index.html     # Main HTML template
│   └── src/
│       ├── App.js         # Root component with routing
│       ├── components/    # React UI components
│       │   ├── Home.js                # Landing page
│       │   ├── InboundProcess.js      # Receiving workflow
│       │   ├── OutboundProcess.js     # Dispatch workflow
│       │   ├── ManifestCreation.js    # Bulk upload
│       │   ├── InventoryDashboard.js  # Analytics
│       │   └── BarcodeScanner.js      # Camera scanner
│       └── services/
│           └── api.js     # Axios API client
│
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
├── db.sqlite3            # SQLite database file
└── README.md             # This file
```


## Database Models

### Bin (Storage Container)
Represents physical storage locations in the warehouse.

**Fields:**
- `bin_id` (Primary Key) - Unique identifier (e.g., BIN-A001)
- `location` - Physical location description
- `capacity` - Maximum number of packages
- `status` - Current state: `available` | `occupied` | `maintenance`
- `created_at`, `updated_at` - Timestamps

**States:**
- **available**: Ready to receive packages
- **occupied**: Contains packages
- **maintenance**: Temporarily unavailable

### Shipment (Package)
Tracks individual packages through the warehouse lifecycle.

**Fields:**
- `tracking_id` (Primary Key) - Unique tracking number
- `bin` (Foreign Key) - Associated bin (nullable)
- `status` - Current state in workflow
- `manifested` (Boolean) - Whether registered with delivery partner
- `time_in` - When package entered warehouse
- `time_out` - When package was picked up
- `created_at`, `updated_at` - Timestamps

**Status Flow:**
```
manifested → putaway → picklist-created → picked → dispatched
```

### AuditLog (Activity Tracking)
Maintains complete history of all package operations.

**Fields:**
- `action` - Type of operation: `assigned` | `updated` | `dissociated` | `dispatched`
- `shipment` (Foreign Key) - Related package
- `user` - Who performed the action
- `timestamp` - When it occurred
- `details` - Description of the action

## API Endpoints

### Inbound Operations

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/api/inbound/scan_bin/` | Validate bin availability | `{bin_id: string}` |
| POST | `/api/inbound/assign/` | Assign package to bin | `{bin_id: string, tracking_id: string}` |
| POST | `/api/inbound/upload_manifest/` | Bulk create shipments | `{tracking_ids: array}` |

**Example:**
```javascript
// Scan bin
POST /api/inbound/scan_bin/
{ "bin_id": "BIN-A001" }

// Response
{ "success": true, "bin": {...} }
```

### Outbound Operations

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/api/outbound/get_bin_packages/` | List packages in bin | `{bin_id: string}` |
| POST | `/api/outbound/pickup_package/` | Mark package as picked | `{tracking_id: string, bin_id: string}` |
| POST | `/api/outbound/dispatch_packages/` | Batch dispatch | `{tracking_ids: array}` |
| POST | `/api/outbound/process_picklist_file/` | Process CSV/JSON file | `{tracking_ids: array}` |

**Example:**
```javascript
// Pickup package
POST /api/outbound/pickup_package/
{ "tracking_id": "PKG-0001", "bin_id": "BIN-A001" }

// Response
{ "success": true, "package": {...} }
```

### Data Access

| Method | Endpoint | Purpose | Query Params |
|--------|----------|---------|--------------|
| GET | `/api/bins/` | List all bins | - |
| GET | `/api/shipments/` | List all shipments | - |
| GET | `/api/audit-logs/` | View audit history | - |

## Technical Details

### Backend Stack

**Django 6.0** - Web framework
- Robust ORM for database operations
- Built-in admin interface
- Middleware support for CORS, authentication

**Django REST Framework** - API toolkit
- ViewSets for clean API structure
- Serializers for validation and transformation
- Browsable API for testing

**SQLite** - Database
- Zero-configuration embedded database
- Perfect for development and small deployments
- Easy backup (single file)

### Frontend Stack

**React 18** - UI library
- Component-based architecture
- Virtual DOM for performance
- Hooks for state management (useState, useEffect)

**React Router** - Navigation
- Client-side routing
- Browser history management
- Nested routes support

**Axios** - HTTP client
- Promise-based API calls
- Automatic JSON transformation
- Request/response interceptors

**html5-qrcode** - Scanner library
- Camera access and barcode detection
- Multiple format support (QR, EAN, Code 128, UPC)
- Real-time scanning with callbacks

### Configuration

**CORS Setup** (`backend/settings.py`):
```python
INSTALLED_APPS = [
    'corsheaders',
    'rest_framework',
    'inbound',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

**API Configuration** (`frontend/src/services/api.js`):
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export default {
    post: (endpoint, data) => axios.post(`${API_BASE_URL}${endpoint}`, data),
    get: (endpoint) => axios.get(`${API_BASE_URL}${endpoint}`)
};
```

## Features in Detail

### Barcode Scanner Integration
- **Multi-format support**: QR codes, EAN-13/8, Code 39/128, UPC-A/E, ITF
- **Camera access**: Uses device camera via WebRTC
- **Real-time detection**: Automatic scanning without button press
- **Fallback option**: Manual entry always available

### Real-time Updates
- **Live status changes**: Bin and package status updates immediately
- **Capacity tracking**: Bin utilization calculated on-the-fly
- **Audit trails**: Every action logged with timestamp and user

### Responsive Design
- **Desktop optimized**: Full feature set on large screens
- **Tablet support**: Touch-friendly interface
- **Mobile capable**: Basic operations work on phones

## Development

### Available Commands

```bash
# Django
python manage.py makemigrations   # Create database migrations
python manage.py migrate           # Apply migrations
python manage.py createsuperuser   # Create admin user
python manage.py seed_data         # Populate sample data
python manage.py runserver         # Start dev server

# React
npm start                          # Development server with hot reload
npm run build                      # Production build
npm test                           # Run test suite
npm run eject                      # Eject from Create React App
```

### Database Seeding

The `seed_data` command creates sample bins:
```python
python manage.py seed_data

# Creates:
# BIN-001 through BIN-010
# Warehouse A - Row 1, Row 2, Row 3
```

## Tech Stack

**Backend**
- Django 6.0
- Django REST Framework 3.14
- django-cors-headers 4.3
- SQLite 3

**Frontend**
- React 18.2
- React Router 6.20
- Axios 1.6
- html5-qrcode 2.3

## License

MIT License - Free for personal and commercial use.

---

**Built with Django and React** | For questions, see [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
