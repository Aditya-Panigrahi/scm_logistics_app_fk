# Ekart Logistics - Warehouse Management System

**Full-stack multi-warehouse logistics application with role-based access control**

**Tech Stack:** Django REST Framework + React + JWT Authentication + SQLite

> 📖 **Quick Start:** See [sample_docs/QUICK_REFERENCE.md](sample_docs/QUICK_REFERENCE.md) for installation and startup guide.

---

## 🎯 Overview

Enterprise-grade warehouse management solution featuring automated package tracking, multi-warehouse support, role-based permissions, and real-time inventory monitoring. Fully responsive design optimized for mobile, tablet, and desktop devices.

## ✨ Core Features

### 🔐 Authentication & Security
- JWT-based authentication with auto-refresh
- 4 user roles: Superadmin, Operation Head, Warehouse Admin, Operator
- Multi-warehouse support with data isolation
- Granular role-based permissions

### 📦 Inbound Process
- Two-step assignment: Scan bin → Scan package → Assign
- Camera/barcode scanner integration
- Real-time bin capacity tracking
- Complete audit trails

### 📋 Manifest Management
- CSV/JSON bulk upload for batch registration
- Automatic status reconciliation
- Detailed success/failure reports
- Warehouse-level management

### 🚚 Outbound Process
- **Dual-mode operation:** Pickup by Bin or Pickup by File
- **Bin mode:** Load bin, scan packages, bulk scanning support
- **File mode:** Upload picklist, assign to operators (manual or auto round-robin)
- **Operator workflow:** View assigned shipments, scan to dispatch
- **Status tracking:** Manifested/Direct → Picklist Created → Picked → Dispatched
- Pickup verification with barcode scanning

### 📊 Inventory Dashboard
- Real-time warehouse capacity metrics
- Bin status visualization (occupied/available/maintenance)
- Package status distribution
- Advanced filters and search
- Per-warehouse or global view for superadmins

### 👥 User Management
- Create, edit, delete user accounts
- Assign roles and warehouse access
- Password management
- Role-based UI rendering

### 🏢 Warehouse Management
- Create and configure warehouses (Superadmin only)
- Edit details and contact information
- Manage warehouse status

### 📱 Responsive Design
- **Fully responsive** across all devices
- Mobile-first approach (480px, 768px, 1024px breakpoints)
- Touch-friendly (44px minimum targets)
- Landscape mode optimization
- Cross-browser compatible (Chrome, Firefox, Safari, Edge)

### 🎨 Branding & UX
- Ekart logo on all pages (login, register, navigation)
- Consistent blue theme (#2874f0)
- Clean card-based layouts
- Professional authentication pages

## 👤 User Roles

| Role | Access Level | Features |
|------|--------------|----------|
| **Superadmin** | Full system access | All warehouses, User & Warehouse Management, All operations |
| **Operation Head** | Read-only | View all operations, no modifications |
| **Warehouse Admin** | Full operational control | All operations within assigned warehouse, User Management |
| **Operator** | Limited operations | Inbound Process, Outbound Pickup by Bin, Assigned Shipments |

## 🏗️ System Architecture

```
┌────────────────────────────────────┐
│   React Frontend (Port 3000)       │
│   - JWT auth with auto-refresh     │
│   - Role-based UI                  │
│   - Responsive design              │
└────────────┬───────────────────────┘
             │ REST API (JSON + JWT)
┌────────────┴───────────────────────┐
│   Django Backend (Port 8000)       │
│   - JWT validation & refresh       │
│   - Role-based permissions         │
│   - Multi-warehouse filtering      │
└────────────┬───────────────────────┘
             │
┌────────────┴───────────────────────┐
│       SQLite Database              │
│   - Users, Warehouses, Bins        │
│   - Shipments, AuditLogs           │
└────────────────────────────────────┘
```

## 📊 Data Models

### Core Entities

**CustomUser** - Extended Django user with role and warehouse assignment
- Roles: SUPERADMIN | OPERATION_HEAD | WAREHOUSE_ADMIN | OPERATOR
- Multi-warehouse access for superadmins

**Warehouse** - Physical warehouse locations
- Unique warehouse_id, name, location, contact info

**Bin** - Storage containers within warehouses
- Status: available | occupied | maintenance
- Capacity tracking

**Shipment** - Individual packages
- Status flow: `manifested → putaway → picklist-created → picked → dispatched`
- Operator assignment support
- Manifest tracking

**AuditLog** - Complete operation history
- Actions: assigned | updated | dissociated | dispatched

## 🔗 API Endpoints

### Authentication
- `POST /api/accounts/auth/register/` - User registration
- `POST /api/accounts/auth/login/` - Authentication
- `GET /api/accounts/auth/me/` - Current user info
- `POST /api/accounts/auth/refresh/` - Token refresh

### Operations
- `POST /api/inbound/scan_bin/` - Validate bin
- `POST /api/inbound/assign/` - Assign package to bin
- `POST /api/inbound/upload_manifest/` - Bulk upload
- `POST /api/outbound/get_bin_packages/` - List packages in bin
- `POST /api/outbound/pickup_package/` - Mark picked
- `POST /api/outbound/dispatch_packages/` - Dispatch from bin
- `POST /api/outbound/process_picklist_file/` - Process file upload
- `POST /api/outbound/assign_to_operator/` - Assign to operator
- `POST /api/outbound/auto_assign_to_operators/` - Auto round-robin
- `GET /api/outbound/my_assigned_shipments/` - Operator assignments
- `GET /api/dashboard/stats/` - Warehouse statistics

### Management
- `GET/POST/PATCH/DELETE /api/accounts/users/` - User CRUD
- `GET/POST/PATCH/DELETE /api/accounts/warehouses/` - Warehouse CRUD
- `GET /api/bins/` - List bins
- `GET /api/shipments/` - List shipments

**Authentication:** All endpoints (except register/login) require JWT token:
```
Authorization: Bearer <access_token>
```

## 🛠️ Technology Stack

### Backend
- Django 6.0 - Web framework
- Django REST Framework 3.14 - API
- djangorestframework-simplejwt 5.3.1 - JWT auth
- django-cors-headers 4.3 - CORS
- SQLite 3 - Database

### Frontend
- React 18.2 - UI library
- React Router 6.20 - Routing
- Axios 1.6 - HTTP client
- html5-qrcode 2.3 - Barcode scanner

## 📁 Project Structure

```
scm_logistics_app_fk/
├── accounts/              # Auth & user management
├── backend/               # Django config (settings, urls)
├── inbound/               # Operations (models, views, serializers)
├── frontend/
│   └── src/
│       ├── components/    # React components with CSS
│       ├── context/       # AuthContext
│       └── services/      # API client (api.js)
├── manage.py
├── requirements.txt
├── db.sqlite3
├── README.md              # This file
└── sample_docs/
    └── QUICK_REFERENCE.md # Setup & troubleshooting guide
```
```

## 📚 Additional Resources

- **[QUICK_REFERENCE.md](sample_docs/QUICK_REFERENCE.md)** - Detailed setup, troubleshooting, and FAQs
- **Django Admin** - http://localhost:8000/admin - Direct database access
- **API Browser** - http://localhost:8000/api - Interactive API testing
