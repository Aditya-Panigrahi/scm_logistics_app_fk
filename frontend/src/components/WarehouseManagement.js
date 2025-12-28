import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './WarehouseManagement.css';

const WarehouseManagement = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [formData, setFormData] = useState({
        warehouse_id: '',
        name: '',
        location: '',
        contact_email: '',
        contact_phone: '',
        is_active: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/accounts/warehouses/');
            // Handle paginated response
            const warehousesData = response.data.results || response.data;
            const finalData = Array.isArray(warehousesData) ? warehousesData : [];
            setWarehouses(finalData);
            setError(''); // Clear any previous errors
        } catch (error) {
            setError('Failed to fetch warehouses');
            console.error('Error fetching warehouses:', error);
            setWarehouses([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        setFormData({
            warehouse_id: warehouse.warehouse_id,
            name: warehouse.name,
            location: warehouse.location || '',
            contact_email: warehouse.contact_email || '',
            contact_phone: warehouse.contact_phone || '',
            is_active: warehouse.is_active
        });
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleCreate = () => {
        setEditingWarehouse(null);
        setFormData({
            warehouse_id: '',
            name: '',
            location: '',
            contact_email: '',
            contact_phone: '',
            is_active: true
        });
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (editingWarehouse) {
                // Update existing warehouse
                await api.patch(`/accounts/warehouses/${editingWarehouse.warehouse_id}/`, formData);
                setSuccess('Warehouse updated successfully!');
            } else {
                // Create new warehouse
                await api.post('/accounts/warehouses/', formData);
                setSuccess('Warehouse created successfully!');
            }
            
            // Refresh the warehouses list immediately
            await fetchWarehouses();
            
            // Close modal after a short delay to show success message
            setTimeout(() => {
                setShowModal(false);
                setSuccess('');
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.detail || error.response?.data?.warehouse_id?.[0] || 'Failed to save warehouse');
            console.error('Error saving warehouse:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (warehouseId, warehouseName) => {
        if (window.confirm(`Are you sure you want to delete warehouse "${warehouseName}"? This action cannot be undone.`)) {
            setLoading(true);
            try {
                await api.delete(`/accounts/warehouses/${warehouseId}/`);
                setSuccess('Warehouse deleted successfully!');
                fetchWarehouses();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                setError(error.response?.data?.detail || 'Failed to delete warehouse. It may have users or data associated with it.');
                console.error('Error deleting warehouse:', error);
                setTimeout(() => setError(''), 5000);
            } finally {
                setLoading(false);
            }
        }
    };

    const getRoleDisplayName = (role) => {
        const roleNames = {
            'SUPERADMIN': 'Superadmin',
            'WAREHOUSE_ADMIN': 'Warehouse Admin',
            'OPERATION_HEAD': 'Operation Head',
            'OPERATOR': 'Operator'
        };
        return roleNames[role] || role;
    };

    return (
        <div className="warehouse-management-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <img 
                            src="https://static-assets-web.flixcart.com/ekart-assets/assets/fonts/ekWhiteLogo.9be1302c8c55ee6342ddaa8e9a3e00aa.png" 
                            alt="Ekart Logistics" 
                            className="logo-img"
                        />
                    </div>
                    <div className="user-section">
                        <div className="user-info">
                            <span className="user-name">{user?.username}</span>
                            <span className="user-role">{getRoleDisplayName(user?.role)}</span>
                        </div>
                        <button onClick={() => navigate('/')} className="back-button">
                            ← Back
                        </button>
                        <button onClick={logout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="content-header">
                    <h1>Warehouse Management</h1>
                    <button onClick={handleCreate} className="create-button">
                        + Create New Warehouse
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {loading && !showModal ? (
                    <div className="loading">Loading warehouses...</div>
                ) : (
                    <div className="warehouses-grid">
                        {Array.isArray(warehouses) && warehouses.length > 0 ? (
                            warehouses.map((warehouse) => (
                                <div key={warehouse.warehouse_id} className="warehouse-card">
                                    <div className="warehouse-header">
                                        <h3>{warehouse.name}</h3>
                                        <span className={`status-badge ${warehouse.is_active ? 'status-active' : 'status-inactive'}`}>
                                            {warehouse.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="warehouse-details">
                                        <div className="detail-item">
                                            <span className="detail-label">ID:</span>
                                            <span className="detail-value">{warehouse.warehouse_id}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Location:</span>
                                            <span className="detail-value">{warehouse.location || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{warehouse.contact_email || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Phone:</span>
                                            <span className="detail-value">{warehouse.contact_phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="warehouse-actions">
                                        <button 
                                            onClick={() => handleEdit(warehouse)} 
                                            className="action-button edit-button"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(warehouse.warehouse_id, warehouse.name)} 
                                            className="action-button delete-button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{textAlign: 'center', padding: '40px', color: 'white', fontSize: '18px'}}>
                                No warehouses found. Click "Create New Warehouse" to add one.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingWarehouse ? 'Edit Warehouse' : 'Create New Warehouse'}</h2>
                            <button onClick={() => setShowModal(false)} className="close-button">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <div className="form-group">
                                <label>Warehouse ID *</label>
                                <input
                                    type="text"
                                    value={formData.warehouse_id}
                                    onChange={(e) => setFormData({...formData, warehouse_id: e.target.value.toUpperCase()})}
                                    required
                                    disabled={editingWarehouse}
                                    placeholder="e.g., WH001"
                                />
                                <small>Unique identifier for the warehouse</small>
                            </div>

                            <div className="form-group">
                                <label>Warehouse Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    placeholder="e.g., Main Distribution Center"
                                />
                            </div>

                            <div className="form-group">
                                <label>Location *</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    required
                                    placeholder="e.g., Bangalore, Karnataka"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Email</label>
                                    <input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                        placeholder="warehouse@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                        placeholder="+91-XX-XXXXXXXX"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    />
                                    Active
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-button">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-button" disabled={loading}>
                                    {loading ? 'Saving...' : (editingWarehouse ? 'Update Warehouse' : 'Create Warehouse')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseManagement;
