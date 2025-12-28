# Ekart Logistics - Warehouse Management System

Full-stack multi-warehouse logistics application with role-based access control for complete package lifecycle management.

**Stack:** Django REST Framework + React + JWT Authentication + SQLite

> 📖 **Quick Start?** See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for installation and startup instructions.

## Overview

Enterprise-grade warehouse management solution featuring automated package tracking, multi-warehouse support, role-based permissions, and real-time inventory monitoring. Built with modern web technologies for scalability, security, and ease of use.

## Key Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token refresh
- **4 user roles**: Superadmin, Operation Head, Warehouse Admin, Operator
- **Multi-warehouse support** with data isolation between warehouses
- **Granular permissions** controlling access to each feature
- **User & Warehouse Management** interfaces for administrators

### 📦 Inbound Process
Receive and store incoming packages efficiently:
- **Two-step assignment workflow**: Scan bin → Scan package → Assign
- **Camera/barcode scanner integration** for hands-free operation
- **Real-time bin capacity tracking** prevents overfilling
- **Auto-validation** ensures data integrity
- **Complete audit trails** for all operations
- **Warehouse-specific data** isolation

### 📋 Manifest Creation
Bulk shipment registration for high-volume operations:
- **CSV/JSON file upload** for batch processing
- **Automatic status reconciliation** with delivery partners
- **Detailed success/failure reports** for tracking
- **Bulk status updates** for hundreds of packages at once
- **Warehouse-level manifest management**

### 🚚 Outbound Process
Efficient package retrieval and dispatch:
- **Package location search** - quickly find any package
- **Bin audit capability** - verify bin contents
- **Pickup verification workflow** - scan to confirm
- **Automatic bin release** when empty
- **File-based picklist processing** for batch operations
- **Role-based access**: Operators limited to bin pickup only

### 📊 Inventory Dashboard
Real-time warehouse analytics and monitoring:
- **Warehouse capacity metrics** - utilization, available space
- **Bin status visualization** - occupied/available/maintenance
- **Package status distribution** - track shipment lifecycle
- **Live updates** without page refresh
- **Advanced filters and search** for quick access
- **Per-warehouse or global view** for superadmins

### 👥 User Management (Superadmin/Warehouse Admin)
- Create, edit, and delete user accounts
- Assign roles and warehouse access
- View user details with role badges
- Manage passwords and user status

### 🏢 Warehouse Management (Superadmin Only)
- Create and configure warehouses
- Edit warehouse details and contact information
- View warehouse cards with key information
- Manage warehouse status (active/inactive)

## User Roles & Permissions

### Superadmin
- **Full system access** across all warehouses
- Can **switch between warehouses** via dropdown selector
- Manages **users and warehouses**
- Access to all 6 applications: Manifest, Inbound, Outbound (both modes), Inventory, User Management, Warehouse Management

### Operation Head
- **Read-only access** to warehouse operations
- Can view but **cannot modify** data
- Access to: Manifest, Inbound, Outbound, Inventory Dashboard
- Limited to **assigned warehouse**

### Warehouse Admin
- **Full operational control** within assigned warehouse
- Can perform all CRUD operations
- Manages **users within their warehouse**
- Access to: Manifest, Inbound, Outbound, Inventory Dashboard
- Cannot access other warehouses

### Operator
- **Limited access** for daily operations
- Access only to: **Inbound Process** and **Outbound Pickup by Bin**
- Cannot upload manifests or use file-based outbound
- Restricted to **assigned warehouse**

## Architecture

### System Design

```
┌──────────────────────────────────────────────┐
│       React Frontend (Port 3000)             │
│  - JWT authentication with auto-refresh      │
│  - Role-based UI rendering                   │
│  - Warehouse context management              │
│  - Protected routes                          │
└──────────────────┬───────────────────────────┘
                   │ REST API (JSON + JWT)
┌──────────────────┴───────────────────────────┐
│        Django Backend (Port 8000)            │
│  - JWT token validation & refresh            │
│  - Role-based permissions                    │
│  - Multi-warehouse data filtering            │
│  - RESTful API endpoints                     │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────┴───────────────────────────┐
│            SQLite Database                   │
│  - Users, Warehouses, Bins                   │
│  - Shipments, AuditLogs                      │
└──────────────────────────────────────────────┘
```

## Project Structure

```
scm_logistics_app_fk/
├── accounts/              # Authentication & user management
│   ├── models.py          # CustomUser, Warehouse models
│   ├── serializers.py     # User, Auth, Warehouse serializers
│   ├── views.py           # Auth, User, Warehouse ViewSets
│   ├── urls.py            # Auth API routing
│   └── permissions.py     # Role-based permission classes
│
├── backend/               # Django configuration
│   ├── settings.py        # JWT, CORS, apps configuration
│   ├── urls.py            # Root URL routing
│   ├── wsgi.py            # WSGI server config
│   └── asgi.py            # ASGI server config
│
├── inbound/               # Warehouse operations
│   ├── models.py          # Bin, Shipment, AuditLog models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # Inbound/Outbound/Dashboard ViewSets
│   ├── urls.py            # Operations API routing
│   └── management/
│       └── commands/
│           └── seed_data.py  # Database seeding script
│
├── frontend/
│   ├── public/
│   │   └── index.html     # Main HTML template
│   └── src/
│       ├── App.js         # Root with protected routes
│       ├── context/
│       │   └── AuthContext.js  # Auth state management
│       ├── components/
│       │   ├── Login.js               # Login page
│       │   ├── Register.js            # User registration
│       │   ├── Home.js                # Landing with warehouse selector
│       │   ├── PrivateRoute.js        # Route protection HOC
│       │   ├── InboundProcess.js      # Receiving workflow
│       │   ├── OutboundProcess.js     # Dispatch workflow
│       │   ├── ManifestCreation.js    # Bulk upload
│       │   ├── InventoryDashboard.js  # Analytics
│       │   ├── UserManagement.js      # User CRUD
│       │   ├── WarehouseManagement.js # Warehouse CRUD
│       │   └── BarcodeScanner.js      # Camera scanner
│       └── services/
│           └── api.js     # Axios with JWT interceptors
│
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
├── db.sqlite3            # SQLite database file
└── README.md             # This file
```


## Database Models

### CustomUser (Extended Django User)
User accounts with role-based access control.

**Fields:**
- Inherits from `AbstractUser` (username, email, password, etc.)
- `role` - User role: `SUPERADMIN` | `OPERATION_HEAD` | `WAREHOUSE_ADMIN` | `OPERATOR`
- `warehouse` (Foreign Key) - Primary warehouse assignment
- `accessible_warehouses` (Many-to-Many) - Additional warehouses for superadmin
- `phone_number` - Contact number
- `employee_id` - Internal employee identifier
- `is_active` - Account status

### Warehouse
Represents physical warehouse locations.

**Fields:**
- `warehouse_id` (Primary Key) - Unique identifier (e.g., WH001)
- `name` - Warehouse name
- `location` - Physical address
- `contact_email` - Warehouse email
- `contact_phone` - Warehouse phone
- `is_active` - Operational status
- `created_at`, `updated_at` - Timestamps

### Bin (Storage Container)
Represents physical storage locations within a warehouse.

**Fields:**
- `bin_id` (Primary Key) - Unique identifier (e.g., BIN-A001)
- `warehouse` (Foreign Key) - Parent warehouse
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
- `warehouse` (Foreign Key) - Current warehouse location
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
- `warehouse` (Foreign Key) - Where action occurred
- `action` - Type of operation: `assigned` | `updated` | `dissociated` | `dispatched`
- `shipment` (Foreign Key) - Related package
- `user` - Who performed the action
- `timestamp` - When it occurred
- `details` - Description of the action

## API Endpoints

### Authentication

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/api/accounts/auth/register/` | Create new user account | `{username, email, password, role, warehouse, ...}` |
| POST | `/api/accounts/auth/login/` | Authenticate user | `{username, password}` |
| GET | `/api/accounts/auth/me/` | Get current user info | - |
| POST | `/api/accounts/auth/change-password/` | Update password | `{old_password, new_password}` |
| POST | `/api/accounts/auth/refresh/` | Refresh JWT token | `{refresh: token}` |

### User & Warehouse Management

| Method | Endpoint | Purpose | Access |
|--------|----------|---------|--------|
| GET | `/api/accounts/users/` | List users | Superadmin, Warehouse Admin |
| POST | `/api/accounts/users/` | Create user | Superadmin, Warehouse Admin |
| PATCH | `/api/accounts/users/{id}/` | Update user | Superadmin, Warehouse Admin |
| DELETE | `/api/accounts/users/{id}/` | Delete user | Superadmin, Warehouse Admin |
| GET | `/api/accounts/warehouses/` | List warehouses | Authenticated |
| POST | `/api/accounts/warehouses/` | Create warehouse | Superadmin only |
| PATCH | `/api/accounts/warehouses/{id}/` | Update warehouse | Superadmin only |
| DELETE | `/api/accounts/warehouses/{id}/` | Delete warehouse | Superadmin only |

### Inbound Operations

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/api/inbound/scan_bin/` | Validate bin availability | `{bin_id: string}` |
| POST | `/api/inbound/assign/` | Assign package to bin | `{bin_id: string, tracking_id: string}` |
| POST | `/api/inbound/upload_manifest/` | Bulk create shipments | `{tracking_ids: array}` |
| GET | `/api/bins/` | List bins (filtered by warehouse) | `?warehouse_id={id}` (superadmin only) |

**Example:**
```javascript
// Login
POST /api/accounts/auth/login/
{ "username": "superadmin", "password": "superadmin" }

// Response
{ 
  "user": {...}, 
  "tokens": { "access": "...", "refresh": "..." }
}

// Scan bin (with JWT token in Authorization header)
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
| GET | `/api/shipments/` | List shipments (filtered by warehouse) | `?warehouse_id={id}` (superadmin only) |

**Example:**
```javascript
// Pickup package (with JWT token)
POST /api/outbound/pickup_package/
{ "tracking_id": "PKG-0001", "bin_id": "BIN-A001" }

// Response
{ "success": true, "package": {...} }
```

### Dashboard & Audit

| Method | Endpoint | Purpose | Query Params |
|--------|----------|---------|--------------|
| GET | `/api/dashboard/stats/` | Warehouse statistics | `?warehouse_id={id}` (superadmin only) |
| GET | `/api/audit-logs/` | View audit history | `?warehouse_id={id}` (superadmin only) |

**Note:** All endpoints (except auth/register and auth/login) require JWT authentication via `Authorization: Bearer <token>` header. Superadmins can filter data by `warehouse_id` query parameter to view specific warehouse data.

## Technical Details

### Backend Stack

**Django 6.0** - Web framework
- Custom user model with role-based permissions
- Robust ORM for database operations with multi-warehouse filtering
- Built-in admin interface
- Middleware support for CORS, JWT authentication

**Django REST Framework** - API toolkit
- ViewSets with permission classes for access control
- Serializers for validation and transformation
- Browsable API for testing
- Pagination support (20 items per page)

**djangorestframework-simplejwt** - JWT Authentication
- Secure token-based authentication
- 1-hour access token lifetime
- 7-day refresh token lifetime
- Automatic token rotation

**SQLite** - Database
- Zero-configuration embedded database
- Perfect for development and small-to-medium deployments
- Easy backup (single file)
- Multi-warehouse data isolation

### Frontend Stack

**React 18** - UI library
- Component-based architecture
- Context API for global state (AuthContext)
- Hooks for state management (useState, useEffect)
- Protected routes with permission checking

**React Router 6** - Navigation
- Client-side routing
- Protected route wrapper (PrivateRoute)
- Browser history management
- Nested routes support

**Axios** - HTTP client
- Promise-based API calls
- JWT token injection via interceptors
- Automatic token refresh on 401
- Request/response transformation

**html5-qrcode** - Scanner library
- Camera access and barcode detection
- Multiple format support (QR, EAN, Code 128, UPC)
- Real-time scanning with callbacks

### Security Features

**Authentication:**
- JWT tokens stored in localStorage
- Automatic token refresh before expiration
- Secure password hashing with Django's PBKDF2
- CORS configuration for frontend-backend separation

**Authorization:**
- 7 custom permission classes for granular access control
- Role-based UI rendering
- Warehouse-level data isolation
- Protected API endpoints with permission checks

**Data Validation:**
- Frontend form validation
- Backend serializer validation
- Database constraints and foreign keys

### Configuration

**JWT Settings** (`backend/settings.py`):
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

**CORS Setup** (`backend/settings.py`):
```python
INSTALLED_APPS = [
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'accounts',
    'inbound',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

AUTH_USER_MODEL = 'accounts.CustomUser'
```

**API Configuration** (`frontend/src/services/api.js`):
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Request interceptor - Add JWT token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add warehouse_id for superadmin filtering
    const selectedWarehouse = JSON.parse(
        localStorage.getItem('selectedWarehouse') || 'null'
    );
    if (selectedWarehouse && user?.role === 'SUPERADMIN') {
        config.params = { 
            ...config.params, 
            warehouse_id: selectedWarehouse.warehouse_id 
        };
    }
    
    return config;
});

// Response interceptor - Auto token refresh
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            // Attempt token refresh
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(
                        'http://localhost:8000/api/accounts/auth/refresh/',
                        { refresh: refreshToken }
                    );
                    localStorage.setItem('accessToken', response.data.access);
                    // Retry original request
                    return api.request(error.config);
                } catch {
                    // Refresh failed, logout
                    logout();
                }
            }
        }
        return Promise.reject(error);
    }
);
```

## Features in Detail

### Authentication Flow
1. User logs in with username/password
2. Backend validates credentials and returns JWT tokens (access + refresh)
3. Frontend stores tokens in localStorage
4. All subsequent API calls include access token in Authorization header
5. When access token expires, frontend automatically uses refresh token
6. If refresh fails, user is redirected to login page

### Multi-Warehouse Support
- **Superadmin**: Can switch between warehouses using dropdown selector on home page
- **Other Roles**: Automatically filtered to their assigned warehouse
- **Data Isolation**: Each warehouse's data is completely separated
- **Query Parameter**: Superadmin requests include `?warehouse_id=WH001` to filter data
- **Context Management**: Selected warehouse stored in React Context and localStorage

### Role-Based UI Rendering
- **Dynamic Menu**: Home page shows only apps accessible to user's role
- **Conditional Features**: Operators see limited options in Outbound Process
- **Protected Routes**: PrivateRoute component checks permissions before rendering
- **Permission Helper**: `hasPermission(feature)` function used throughout UI

### Barcode Scanner Integration
- **Multi-format support**: QR codes, EAN-13/8, Code 39/128, UPC-A/E, ITF
- **Camera access**: Uses device camera via WebRTC
- **Real-time detection**: Automatic scanning without button press
- **Fallback option**: Manual entry always available
- **Error handling**: Permission denied, camera not found gracefully handled

### Real-time Updates
- **Live status changes**: Bin and package status updates immediately after operations
- **Capacity tracking**: Bin utilization calculated on-the-fly
- **Audit trails**: Every action logged with timestamp, user, and warehouse
- **Refresh on success**: Management pages automatically reload data after CRUD operations

### Responsive Design
- **Desktop optimized**: Full feature set on large screens with card-based layouts
- **Tablet support**: Touch-friendly interface with larger click targets
- **Mobile capable**: Basic operations work on phones
- **Centered branding**: Ekart logo always centered in header
- **Consistent styling**: Blue theme (#2874f0) throughout application

## Development

### Initial Setup

1. **Create and activate virtual environment:**
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run migrations:**
```bash
python manage.py migrate
```

4. **Create superadmin user:**
```bash
python manage.py createsuperuser
# Username: superadmin
# Password: superadmin (or your choice)
```

5. **Seed sample data:**
```bash
python manage.py seed_data
```

6. **Create warehouses (via Django shell):**
```bash
python manage.py shell
```
```python
from accounts.models import Warehouse, CustomUser

# Create warehouses
Warehouse.objects.create(
    warehouse_id='WH001',
    name='Main Warehouse',
    location='Bangalore, Karnataka',
    contact_email='bangalore@ekart.com',
    contact_phone='+91-80-12345678'
)

Warehouse.objects.create(
    warehouse_id='WH002',
    name='Mumbai Distribution Center',
    location='Mumbai, Maharashtra',
    contact_email='mumbai@ekart.com',
    contact_phone='+91-22-12345678'
)

# Assign warehouses to superadmin
sa = CustomUser.objects.get(username='superadmin')
sa.warehouse = Warehouse.objects.get(warehouse_id='WH001')
sa.accessible_warehouses.set(Warehouse.objects.all())
sa.save()
```

7. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

8. **Start servers:**
```bash
# Terminal 1 - Django backend
python manage.py runserver

# Terminal 2 - React frontend
cd frontend
npm start
```

9. **Access application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

### Available Commands

```bash
# Django Backend
python manage.py makemigrations        # Create database migrations
python manage.py migrate               # Apply migrations
python manage.py createsuperuser       # Create admin user
python manage.py seed_data             # Populate sample bins
python manage.py runserver             # Start dev server (port 8000)
python manage.py shell                 # Django shell for manual operations

# React Frontend
npm start                              # Development server with hot reload (port 3000)
npm run build                          # Production build
npm test                               # Run test suite
npm run eject                          # Eject from Create React App (irreversible)
```

### Test Users & Data

After setup, you'll have:

**Warehouses:**
- WH001: Main Warehouse (Bangalore)
- WH002: Mumbai Distribution Center
- WH003: Chennai Hub (if created)

**Users** (create via UI or Django admin):
- **superadmin** (role: SUPERADMIN) - Full access to all warehouses
- **warehouse_admin** (role: WAREHOUSE_ADMIN) - Manage single warehouse
- **op_head** (role: OPERATION_HEAD) - Read-only access
- **operator** (role: OPERATOR) - Limited operational access

**Sample Bins** (created by seed_data command):
- BIN-001 through BIN-010
- Located in Warehouse A (you may need to update warehouse FK)

### Database Seeding

The `seed_data` command creates sample bins:
```python
python manage.py seed_data

# Creates:
# BIN-001 through BIN-010
# Warehouse A - Row 1, Row 2, Row 3
# Capacity: 50 packages each
```

### Environment Configuration

**Django Settings** (`backend/settings.py`):
- `DEBUG = True` for development
- `ALLOWED_HOSTS = ['*']` for local development
- `SECRET_KEY` - Change in production!

**React Environment**:
- API URL: `http://localhost:8000/api` (hardcoded in api.js)
- For production, update baseURL in `frontend/src/services/api.js`

## Tech Stack

**Backend**
- Django 6.0 - Web framework
- Django REST Framework 3.14 - API toolkit
- djangorestframework-simplejwt 5.3.1 - JWT authentication
- django-cors-headers 4.3 - CORS middleware
- SQLite 3 - Database

**Frontend**
- React 18.2 - UI library
- React Router 6.20 - Client-side routing
- Axios 1.6 - HTTP client
- html5-qrcode 2.3 - Barcode scanner

## Common Tasks

### Adding a New User (via UI)
1. Login as superadmin or warehouse_admin
2. Navigate to User Management (👥)
3. Click "Create New User"
4. Fill in details: username, email, role, warehouse
5. Set password and save

### Creating a New Warehouse (via UI)
1. Login as superadmin
2. Navigate to Warehouse Management (🏢)
3. Click "Create New Warehouse"
4. Enter warehouse_id, name, location, contacts
5. Save

### Switching Warehouses (Superadmin)
1. On home page, find "Select Warehouse" dropdown (centered, above app cards)
2. Click to expand warehouse list
3. Select desired warehouse
4. All apps now show data for that warehouse only

### Assigning Package to Bin
1. Navigate to Inbound Process
2. Enter bin ID or scan with camera
3. Click "Scan Bin"
4. Enter tracking ID or scan package
5. Click "Assign"
6. Package is now in the bin

### Picking Package for Dispatch
1. Navigate to Outbound Process
2. Switch to "Pickup by Bin" tab
3. Enter bin ID
4. View packages in bin
5. Enter tracking ID to pick
6. Click "Pickup" - bin is auto-released when empty

## Troubleshooting

**Backend not starting:**
- Check if virtual environment is activated
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check for migration errors: `python manage.py migrate`

**Frontend not connecting:**
- Verify backend is running on port 8000
- Check CORS settings in `backend/settings.py`
- Clear localStorage and refresh: `localStorage.clear()`

**Login failing:**
- Verify user exists: Check Django admin or create via `createsuperuser`
- Check password is correct
- View browser console for API errors

**Warehouse dropdown empty:**
- Verify warehouses exist in database
- Check superadmin has accessible_warehouses assigned
- Inspect network tab for API response structure

**Permission denied errors:**
- Verify user role has required permissions
- Check permission classes in backend views
- Ensure JWT token is valid (check browser localStorage)

## License

MIT License - Free for personal and commercial use.

## Credits

Built with Django and React for efficient warehouse logistics management.

---

**For detailed setup instructions, see [QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
