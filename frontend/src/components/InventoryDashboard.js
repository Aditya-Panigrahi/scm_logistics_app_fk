import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './InventoryDashboard.css';
import { inboundAPI } from '../services/api';

const InventoryDashboard = () => {
    const navigate = useNavigate();
    const { selectedWarehouse } = useAuth();
    
    // State for data
    const [bins, setBins] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('overview'); // overview, bins, packages
    
    // Filters
    const [binFilter, setBinFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Load data on component mount and when warehouse changes
    useEffect(() => {
        if (selectedWarehouse) {
            loadDashboardData();
        }
    }, [selectedWarehouse]);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [binsResponse, shipmentsResponse] = await Promise.all([
                inboundAPI.getBins(),
                inboundAPI.getShipments()
            ]);
            
            // Extract data from paginated response
            const binsData = Array.isArray(binsResponse.data.results) ? binsResponse.data.results : [];
            const shipmentsData = Array.isArray(shipmentsResponse.data.results) ? shipmentsResponse.data.results : [];
            
            setBins(binsData);
            setShipments(shipmentsData);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Failed to load dashboard data');
            setBins([]);
            setShipments([]);
        } finally {
            setLoading(false);
        }
    };

    // Calculate warehouse statistics
    const getWarehouseStats = () => {
        // Ensure bins and shipments are arrays
        const binsArray = Array.isArray(bins) ? bins : [];
        const shipmentsArray = Array.isArray(shipments) ? shipments : [];
        
        const totalBins = binsArray.length;
        const totalPackages = shipmentsArray.length;
        
        // Calculate bins in use based on actual packages assigned to them
        const binsWithPackages = new Set(
            shipmentsArray
                .filter(s => s.bin !== null && ['manifested', 'putaway', 'picked'].includes(s.status))
                .map(s => s.bin)
        );
        const binsInUse = binsWithPackages.size;
        const availableBins = totalBins - binsInUse;
        
        const totalCapacity = binsArray.reduce((sum, bin) => sum + (bin.capacity || 0), 0);
        const usedCapacity = shipmentsArray.filter(s => s.bin !== null && 
            ['manifested', 'putaway', 'picked'].includes(s.status)).length;
        const utilizationRate = totalCapacity > 0 ? ((usedCapacity / totalCapacity) * 100).toFixed(1) : 0;
        
        const statusCounts = shipmentsArray.reduce((acc, shipment) => {
            acc[shipment.status] = (acc[shipment.status] || 0) + 1;
            return acc;
        }, {});
        
        return {
            totalBins,
            totalPackages,
            binsInUse,
            availableBins,
            totalCapacity,
            usedCapacity,
            utilizationRate,
            statusCounts
        };
    };

    // Get bin details with package counts
    const getBinDetails = () => {
        const shipmentsArray = Array.isArray(shipments) ? shipments : [];
        
        return bins.map(bin => {
            const binPackages = shipmentsArray.filter(s => s.bin === bin.bin_id);
            const packageCount = binPackages.length;
            const utilizationPercent = (bin.capacity || 0) > 0 ? 
                ((packageCount / bin.capacity) * 100).toFixed(0) : 0;
            
            return {
                ...bin,
                packageCount,
                utilizationPercent,
                packages: binPackages
            };
        });
    };

    // Filter shipments based on current filters
    const getFilteredShipments = () => {
        const shipmentsArray = Array.isArray(shipments) ? shipments : [];
        
        return shipmentsArray.filter(shipment => {
            const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
            const matchesBin = !binFilter || (shipment.bin && 
                shipment.bin.toLowerCase().includes(binFilter.toLowerCase()));
            const matchesSearch = !searchQuery || 
                shipment.tracking_id.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesStatus && matchesBin && matchesSearch;
        });
    };

    // Filter bins based on search
    const getFilteredBins = () => {
        return getBinDetails().filter(bin => {
            const matchesSearch = !searchQuery || 
                bin.bin_id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || bin.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    };

    const handleBack = () => {
        navigate('/');
    };

    const stats = getWarehouseStats();
    const filteredShipments = getFilteredShipments();
    const filteredBins = getFilteredBins();

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-message">⏳ Loading dashboard data...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={handleBack}>
                            ← Back
                        </button>
                    </div>
                    <div className="logo-section">
                        <img 
                            src="https://static-assets-web.flixcart.com/ekart-assets/assets/fonts/ekWhiteLogo.9be1302c8c55ee6342ddaa8e9a3e00aa.png" 
                            alt="Ekart Logistics" 
                            className="logo-img"
                        />
                    </div>
                    <div className="header-right"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>📊 Inventory Dashboard</h2>
                        <p>Complete warehouse overview and analytics</p>
                    </div>

                    <div className="card-body">
                        {error && (
                            <div className="error-box">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* View Tabs */}
                        <div className="view-tabs">
                            <button 
                                className={`tab-button ${activeView === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveView('overview')}
                            >
                                📈 Overview
                            </button>
                            <button 
                                className={`tab-button ${activeView === 'bins' ? 'active' : ''}`}
                                onClick={() => setActiveView('bins')}
                            >
                                📦 Bins ({bins.length})
                            </button>
                            <button
                                className={`tab-button ${activeView === 'packages' ? 'active' : ''}`}
                                onClick={() => setActiveView('packages')}
                            >
                                📋 Shipments ({shipments.length})
                            </button>
                        </div>

                        {/* Overview View */}
                        {activeView === 'overview' && (
                            <div className="overview-section">
                                {/* Warehouse Stats Cards */}
                                <div className="stats-grid">
                                    <div className="stat-card primary">
                                        <div className="stat-icon">📦</div>
                                        <div className="stat-info">
                                            <h3>{stats.totalBins}</h3>
                                            <p>Total Bins</p>
                                        </div>
                                    </div>
                                    
                                    <div className="stat-card success">
                                        <div className="stat-icon">✅</div>
                                        <div className="stat-info">
                                            <h3>{stats.availableBins}</h3>
                                            <p>Empty Bins</p>
                                        </div>
                                    </div>
                                    
                                    <div className="stat-card warning">
                                        <div className="stat-icon">🔒</div>
                                        <div className="stat-info">
                                            <h3>{stats.binsInUse}</h3>
                                            <p>Bins In Use</p>
                                        </div>
                                    </div>
                                    
                                    <div className="stat-card info">
                                        <div className="stat-icon">📋</div>
                                        <div className="stat-info">
                                            <h3>{stats.totalPackages}</h3>
                                            <p>Total Shipments</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity Utilization */}
                                <div className="capacity-section">
                                    <h3>📊 Warehouse Capacity Utilization</h3>
                                    <div className="capacity-bar-container">
                                        <div className="capacity-bar">
                                            <div 
                                                className="capacity-fill"
                                                style={{ width: `${stats.utilizationRate}%` }}
                                            >
                                                {stats.utilizationRate}%
                                            </div>
                                        </div>
                                        <div className="capacity-labels">
                                            <span>{stats.usedCapacity} / {stats.totalCapacity} slots used</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Package Status Distribution */}
                                <div className="status-distribution">
                                    <h3>📈 Package Status Distribution</h3>
                                    <div className="status-grid">
                                        {Object.entries(stats.statusCounts).map(([status, count]) => (
                                            <div key={status} className={`status-item status-${status}`}>
                                                <div className="status-count">{count}</div>
                                                <div className="status-label">{status}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="quick-actions">
                                    <h3>⚡ Quick Actions</h3>
                                    <div className="action-buttons">
                                        <button className="action-btn" onClick={() => setActiveView('bins')}>
                                            View All Bins
                                        </button>
                                        <button className="action-btn" onClick={() => setActiveView('packages')}>
                                            View All Shipments
                                        </button>
                                        <button className="action-btn" onClick={loadDashboardData}>
                                            🔄 Refresh Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bins View */}
                        {activeView === 'bins' && (
                            <div className="bins-section">
                                {/* Filters */}
                                <div className="filters-bar">
                                    <input 
                                        type="text"
                                        className="search-input"
                                        placeholder="🔍 Search bins..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <select 
                                        className="filter-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="available">Available</option>
                                        <option value="occupied">Occupied</option>
                                    </select>
                                    <button className="refresh-btn" onClick={loadDashboardData}>
                                        🔄 Refresh
                                    </button>
                                </div>

                                {/* Bins Table */}
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Bin ID</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Capacity</th>
                                                <th>Shipments</th>
                                                <th>Utilization</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBins.map(bin => (
                                                <tr key={bin.id}>
                                                    <td className="bin-id-cell">{bin.bin_id}</td>
                                                    <td>{bin.location}</td>
                                                    <td>
                                                        <span className={`status-badge ${bin.status}`}>
                                                            {bin.status}
                                                        </span>
                                                    </td>
                                                    <td>{bin.capacity}</td>
                                                    <td>{bin.packageCount}</td>
                                                    <td>
                                                        <div className="utilization-bar">
                                                            <div 
                                                                className="utilization-fill"
                                                                style={{ width: `${bin.utilizationPercent}%` }}
                                                            ></div>
                                                            <span className="utilization-text">
                                                                {bin.utilizationPercent}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredBins.length === 0 && (
                                        <div className="no-data">No bins found</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Shipments View */}
                        {activeView === 'packages' && (
                            <div className="packages-section">
                                {/* Filters */}
                                <div className="filters-bar">
                                    <input 
                                        type="text"
                                        className="search-input"
                                        placeholder="🔍 Search tracking ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <select 
                                        className="filter-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="manifested">Manifested</option>
                                        <option value="putaway">Putaway</option>
                                        <option value="picked">Picked</option>
                                        <option value="dispatched">Dispatched</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                    <input 
                                        type="text"
                                        className="search-input"
                                        placeholder="Filter by Bin ID..."
                                        value={binFilter}
                                        onChange={(e) => setBinFilter(e.target.value)}
                                    />
                                    <button className="refresh-btn" onClick={loadDashboardData}>
                                        🔄 Refresh
                                    </button>
                                </div>

                                {/* Shipments Table */}
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Tracking ID</th>
                                                <th>Bin</th>
                                                <th>Status</th>
                                                <th>Source</th>
                                                <th>Time In</th>
                                                <th>Time Out</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredShipments.map(shipment => {
                                                return (
                                                    <tr key={shipment.tracking_id}>
                                                        <td className="tracking-id-cell">
                                                            {shipment.tracking_id}
                                                        </td>
                                                        <td>{shipment.bin_id || '-'}</td>
                                                        <td>
                                                            <span className={`status-badge ${shipment.status}`}>
                                                                {shipment.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {shipment.manifested ? '📋 Manifest' : '🆕 Direct'}
                                                        </td>
                                                        <td>
                                                            {shipment.time_in ? 
                                                                new Date(shipment.time_in).toLocaleString() : '-'}
                                                        </td>
                                                        <td>
                                                            {shipment.time_out ? 
                                                                new Date(shipment.time_out).toLocaleString() : '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {filteredShipments.length === 0 && (
                                        <div className="no-data">No shipments found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;
