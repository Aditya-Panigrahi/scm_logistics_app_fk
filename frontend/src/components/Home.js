import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { user, logout, hasPermission, selectedWarehouse, selectWarehouse } = useAuth();
    const [availableWarehouses, setAvailableWarehouses] = useState([]);
    const [showWarehouseSelector, setShowWarehouseSelector] = useState(false);

    useEffect(() => {
        // Fetch warehouses when component mounts or when navigating back to home
        if (user?.role === 'SUPERADMIN') {
            fetchWarehouses();
        }
    }, [user]);

    // Refresh warehouses when page becomes visible (handles admin panel warehouse creation)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user?.role === 'SUPERADMIN') {
                fetchWarehouses();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user]);

    const fetchWarehouses = async () => {
        try {
            const response = await api.get('/accounts/warehouses/');
            // Handle paginated response
            const warehousesData = response.data.results || response.data;
            const warehouses = Array.isArray(warehousesData) ? warehousesData : [];
            setAvailableWarehouses(warehouses);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            setAvailableWarehouses([]); // Set empty array on error
        }
    };

    const handleWarehouseChange = (warehouse) => {
        selectWarehouse(warehouse);
        setShowWarehouseSelector(false);
    };

    const handleNavigateToInbound = () => {
        navigate('/inbound');
    };

    const handleNavigateToOutbound = () => {
        navigate('/outbound');
    };

    const handleNavigateToManifestCreation = () => {
        navigate('/manifest-creation');
    };

    const handleNavigateToInventoryDashboard = () => {
        navigate('/inventory-dashboard');
    };

    const handleNavigateToUserManagement = () => {
        navigate('/user-management');
    };

    const handleNavigateToWarehouseManagement = () => {
        navigate('/warehouse-management');
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
        <div className="home-container">
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
                            {user?.role !== 'SUPERADMIN' && user?.warehouse_details && (
                                <span className="user-warehouse">
                                    📍 {user.warehouse_details.name}
                                </span>
                            )}
                        </div>
                        <button onClick={logout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="home-content">
                {/* Snowflakes Animation */}
                <div className="snowflakes" aria-hidden="true">
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                </div>

                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="christmas-icon">🎄</div>
                    <h1 className="welcome-title">
                        Welcome to SCM Logistics
                    </h1>
                    <p className="welcome-subtitle">
                        Merry Christmas & Happy Holidays! 🎅
                    </p>
                    <p className="welcome-description">
                        Streamline your warehouse operations with our comprehensive logistics management system
                    </p>
                </div>

                {/* Warehouse Selector for Superadmin */}
                {user?.role === 'SUPERADMIN' && (
                    <div className="warehouse-selector-container">
                        <span className="warehouse-selector-label">Select Warehouse</span>
                        <div className="warehouse-selector-wrapper">
                            <button 
                                className="warehouse-selector-button"
                                onClick={() => setShowWarehouseSelector(!showWarehouseSelector)}
                            >
                                📍 {selectedWarehouse ? selectedWarehouse.name : 'Select Warehouse'}
                                <span className="dropdown-arrow">{showWarehouseSelector ? '▲' : '▼'}</span>
                            </button>
                            {showWarehouseSelector && (
                                <div className="warehouse-dropdown">
                                    {Array.isArray(availableWarehouses) && availableWarehouses.length > 0 ? (
                                        availableWarehouses.map(warehouse => (
                                            <div
                                                key={warehouse.warehouse_id || warehouse.id}
                                                className={`warehouse-option ${selectedWarehouse?.warehouse_id === warehouse.warehouse_id ? 'selected' : ''}`}
                                                onClick={() => handleWarehouseChange(warehouse)}
                                            >
                                                {warehouse.name}
                                                <span className="warehouse-location">{warehouse.location}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="warehouse-option" style={{color: '#999'}}>
                                            No warehouses available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* App Grid */}
                <div className="apps-section">
                    <h2 className="section-title">Select an Application</h2>
                    <div className="apps-grid">
                        {/* Manifest Creation App Card */}
                        {hasPermission('manifest') && (
                            <div 
                                className="app-card manifest-card" 
                                onClick={handleNavigateToManifestCreation}
                            >
                                <div className="app-icon">
                                    📋
                                </div>
                                <h3 className="app-name">Manifest Creation</h3>
                                <p className="app-description">
                                    Upload manifest and create shipment records
                                </p>
                                <div className="app-badge">Active</div>
                            </div>
                        )}

                        {/* Inbound App Card */}
                        {hasPermission('inbound') && (
                            <div 
                                className="app-card inbound-card" 
                                onClick={handleNavigateToInbound}
                            >
                                <div className="app-icon">
                                    📦
                                </div>
                                <h3 className="app-name">Inbound Process</h3>
                                <p className="app-description">
                                    Scan and assign packages to bins
                                </p>
                                <div className="app-badge">Active</div>
                            </div>
                        )}

                        {/* Outbound App Card */}
                        {(hasPermission('outbound') || hasPermission('outbound-pickup')) && (
                            <div 
                                className="app-card outbound-card" 
                                onClick={handleNavigateToOutbound}
                            >
                                <div className="app-icon">
                                    🚚
                                </div>
                                <h3 className="app-name">Outbound Process</h3>
                                <p className="app-description">
                                    Locate and pick up packages for dispatch
                                    {user?.role === 'OPERATOR' && ' (Pickup Only)'}
                                </p>
                                <div className="app-badge">Active</div>
                            </div>
                        )}

                        {/* Inventory Dashboard Card */}
                        {hasPermission('inventory') && (
                            <div 
                                className="app-card dashboard-card" 
                                onClick={handleNavigateToInventoryDashboard}
                            >
                                <div className="app-icon">
                                    📊
                                </div>
                                <h3 className="app-name">Inventory Dashboard</h3>
                                <p className="app-description">
                                    View warehouse analytics and inventory status
                                </p>
                                <div className="app-badge">Active</div>
                            </div>
                        )}

                        {/* User Management Card */}
                        {hasPermission('users') && (
                            <div 
                                className="app-card user-management-card" 
                                onClick={handleNavigateToUserManagement}
                            >
                                <div className="app-icon">
                                    👥
                                </div>
                                <h3 className="app-name">User Management</h3>
                                <p className="app-description">
                                    Manage users, roles, and permissions
                                </p>
                                <div className="app-badge">Admin</div>
                            </div>
                        )}

                        {/* Warehouse Management Card */}
                        {hasPermission('warehouses') && (
                            <div 
                                className="app-card warehouse-management-card" 
                                onClick={handleNavigateToWarehouseManagement}
                            >
                                <div className="app-icon">
                                    🏢
                                </div>
                                <h3 className="app-name">Warehouse Management</h3>
                                <p className="app-description">
                                    Manage warehouses and facilities
                                </p>
                                <div className="app-badge">Admin</div>
                            </div>
                        )}

                        {/* Other Apps Card - Coming Soon */}
                        <div className="app-card other-apps-card disabled">
                            <div className="app-icon">
                                🎯
                            </div>
                            <h3 className="app-name">Other Apps</h3>
                            <p className="app-description">
                                More features and tools
                            </p>
                            <div className="app-badge coming-soon">Coming Soon</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="home-footer">
                    <p>© 2025 Flipkart SCM Logistics. Built by <b><u>Aditya</u></b>.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
