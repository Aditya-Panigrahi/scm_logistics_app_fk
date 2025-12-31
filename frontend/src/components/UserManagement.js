import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'OPERATOR',
        warehouse: '',
        phone_number: '',
        employee_id: '',
        password: '',
        is_active: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchWarehouses();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/accounts/users/');
            // Handle paginated response
            const usersData = response.data.results || response.data;
            const finalData = Array.isArray(usersData) ? usersData : [];
            setUsers(finalData);
            setError(''); // Clear any previous errors
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', error);
            setUsers([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const response = await api.get('/accounts/warehouses/');
            // Handle paginated response
            const warehousesData = response.data.results || response.data;
            const finalData = Array.isArray(warehousesData) ? warehousesData : [];
            setWarehouses(finalData);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            setWarehouses([]); // Set empty array on error
        }
    };

    const handleEdit = (userToEdit) => {
        // Check if warehouse admin is trying to edit
        if (user?.role === 'WAREHOUSE_ADMIN') {
            alert('⚠️ Only Superadmin can edit users. Please contact your Superadmin for assistance.');
            return;
        }
                // Check if warehouse admin is trying to edit
        if (user?.role === 'WAREHOUSE_ADMIN') {
            alert('⚠️ Only Superadmin can edit users. Please contact your Superadmin for assistance.');
            return;
        }
                setEditingUser(userToEdit);
        setFormData({
            username: userToEdit.username,
            email: userToEdit.email || '',
            first_name: userToEdit.first_name || '',
            last_name: userToEdit.last_name || '',
            role: userToEdit.role,
            warehouse: userToEdit.warehouse || '',
            phone_number: userToEdit.phone_number || '',
            employee_id: userToEdit.employee_id || '',
            password: '',
            is_active: userToEdit.is_active
        });
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            role: 'OPERATOR',
            warehouse: '',
            phone_number: '',
            employee_id: '',
            password: '',
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
            // Prepare data - remove empty password for updates
            const submitData = { ...formData };
            if (editingUser && !submitData.password) {
                delete submitData.password;
            }

            if (editingUser) {
                // Update existing user
                await api.patch(`/accounts/users/${editingUser.id}/`, submitData);
                setSuccess('User updated successfully!');
            } else {
                // Create new user
                if (!submitData.password) {
                    setError('Password is required for new users');
                    setLoading(false);
                    return;
                }
                await api.post('/accounts/users/', submitData);
                setSuccess('User created successfully!');
            }
            
            // Refresh the users list immediately
            await fetchUsers();
            
            // Close modal after a short delay to show success message
            setTimeout(() => {
                setShowModal(false);
                setSuccess('');
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.detail || error.response?.data?.username?.[0] || 'Failed to save user');
            console.error('Error saving user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId, username) => {
        // Check if warehouse admin is trying to delete
        if (user?.role === 'WAREHOUSE_ADMIN') {
            alert('⚠️ Only Superadmin can delete users. Please contact your Superadmin for assistance.');
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            setLoading(true);
            try {
                await api.delete(`/accounts/users/${userId}/`);
                setSuccess('User deleted successfully!');
                fetchUsers();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                setError('Failed to delete user');
                console.error('Error deleting user:', error);
                setTimeout(() => setError(''), 3000);
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

    const getRoleBadgeClass = (role) => {
        const classes = {
            'SUPERADMIN': 'badge-superadmin',
            'WAREHOUSE_ADMIN': 'badge-admin',
            'OPERATION_HEAD': 'badge-operation',
            'OPERATOR': 'badge-operator'
        };
        return classes[role] || '';
    };

    return (
        <div className="user-management-container">
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
                    <h1>User Management</h1>
                    <button onClick={handleCreate} className="create-button">
                        + Create New User
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {loading && !showModal ? (
                    <div className="loading">Loading users...</div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Warehouse</th>
                                    <th>Employee ID</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(users) && users.length > 0 ? (
                                    users.map((userItem) => (
                                        <tr key={userItem.id}>
                                            <td><strong>{userItem.username}</strong></td>
                                            <td>{userItem.first_name} {userItem.last_name}</td>
                                            <td>{userItem.email}</td>
                                            <td>
                                                <span className={`role-badge ${getRoleBadgeClass(userItem.role)}`}>
                                                    {getRoleDisplayName(userItem.role)}
                                                </span>
                                            </td>
                                            <td>{userItem.warehouse_details?.name || 'N/A'}</td>
                                            <td>{userItem.employee_id || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge ${userItem.is_active ? 'status-active' : 'status-inactive'}`}>
                                                    {userItem.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="edit-button-wrapper">
                                                    <button 
                                                        onClick={() => handleEdit(userItem)} 
                                                        className="action-button edit-button"
                                                        disabled={user?.role === 'WAREHOUSE_ADMIN'}
                                                    >
                                                        Edit
                                                    </button>
                                                    {user?.role === 'WAREHOUSE_ADMIN' && (
                                                        <span className="edit-tooltip">Contact Superadmin to edit users</span>
                                                    )}
                                                </div>
                                                <div className="delete-button-wrapper">
                                                    <button 
                                                        onClick={() => handleDelete(userItem.id, userItem.username)} 
                                                        className="action-button delete-button"
                                                        disabled={userItem.id === user?.id || user?.role === 'WAREHOUSE_ADMIN'}
                                                    >
                                                        Delete
                                                    </button>
                                                    {user?.role === 'WAREHOUSE_ADMIN' && (
                                                        <span className="delete-tooltip">Contact Superadmin to delete users</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                            <button onClick={() => setShowModal(false)} className="close-button">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required
                                        disabled={editingUser}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        required
                                    >
                                        <option value="OPERATOR">Operator</option>
                                        <option value="WAREHOUSE_ADMIN">Warehouse Admin</option>
                                        <option value="OPERATION_HEAD">Operation Head</option>
                                        <option value="SUPERADMIN">Superadmin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Warehouse {formData.role !== 'SUPERADMIN' && '*'}</label>
                                    <select
                                        value={formData.warehouse}
                                        onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                                        required={formData.role !== 'SUPERADMIN'}
                                    >
                                        <option value="">Select Warehouse</option>
                                        {warehouses.map((wh) => (
                                            <option key={wh.warehouse_id} value={wh.warehouse_id}>
                                                {wh.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Employee ID</label>
                                    <input
                                        type="text"
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Password {!editingUser && '*'}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                                    required={!editingUser}
                                />
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
                                    {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
