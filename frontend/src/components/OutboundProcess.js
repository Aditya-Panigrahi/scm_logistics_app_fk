import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OutboundProcess.css';
import BarcodeScanner from './BarcodeScanner';
import api, { outboundAPI } from '../services/api';

const OutboundProcess = () => {
    const navigate = useNavigate();
    const { user, selectedWarehouse } = useAuth();
    
    // Tab state
    const [activeTab, setActiveTab] = useState('bin'); // 'bin' or 'file'
    
    // Main state
    const [binId, setBinId] = useState('');
    const [packages, setPackages] = useState([]);
    const [binInfo, setBinInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    
    // File-based pickup state
    const [uploadedFile, setUploadedFile] = useState(null);
    const [filePackages, setFilePackages] = useState([]);
    const [fileLoading, setFileLoading] = useState(false);
    const [fileError, setFileError] = useState(null);
    const [fileMessage, setFileMessage] = useState(null);
    
    // Modal states
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [showBinScanner, setShowBinScanner] = useState(false);
    
    // Current package being picked up
    const [currentPickupPackage, setCurrentPickupPackage] = useState(null);
    const [scannedTrackingId, setScannedTrackingId] = useState('');
    const [pickupError, setPickupError] = useState(null);
    const [showPickupScanner, setShowPickupScanner] = useState(false);
    
    // Dispatch verification
    const [scannedDispatchBinId, setScannedDispatchBinId] = useState('');
    const [dispatchError, setDispatchError] = useState(null);
    const [showDispatchScanner, setShowDispatchScanner] = useState(false);
    
    // Operator assignment state
    const [operators, setOperators] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    
    // Assigned shipments state (for operators)
    const [assignedShipments, setAssignedShipments] = useState([]);
    const [assignedLoading, setAssignedLoading] = useState(false);
    const [assignedError, setAssignedError] = useState(null);
    const [assignedMessage, setAssignedMessage] = useState(null);
    
    // Dispatch assigned shipment state
    const [showAssignedDispatchModal, setShowAssignedDispatchModal] = useState(false);
    const [currentAssignedShipment, setCurrentAssignedShipment] = useState(null);
    const [scannedAssignedTrackingId, setScannedAssignedTrackingId] = useState('');
    const [assignedDispatchError, setAssignedDispatchError] = useState(null);
    const [showAssignedDispatchScanner, setShowAssignedDispatchScanner] = useState(false);
    
    // Bulk scanning state
    const [showBulkScanModal, setShowBulkScanModal] = useState(false);
    const [bulkScanTrackingId, setBulkScanTrackingId] = useState('');
    const [bulkScanError, setBulkScanError] = useState(null);
    const [bulkScanSuccess, setBulkScanSuccess] = useState(null);
    const [showBulkScanner, setShowBulkScanner] = useState(false);

    // Reset state when warehouse changes
    useEffect(() => {
        setBinId('');
        setPackages([]);
        setBinInfo(null);
        setError(null);
        setMessage(null);
        setUploadedFile(null);
        setFilePackages([]);
        setFileError(null);
        setFileMessage(null);
        
        // Load operators for admins/managers
        if (user?.role !== 'OPERATOR') {
            loadOperators();
        }
        
        // Load assigned shipments for operators
        if (user?.role === 'OPERATOR') {
            loadAssignedShipments();
        }
    }, [selectedWarehouse, user]);
    
    // Load operators for the warehouse
    const loadOperators = async () => {
        try {
            const response = await outboundAPI.getWarehouseOperators();
            if (response.data.success) {
                setOperators(response.data.operators);
            }
        } catch (error) {
            console.error('Failed to load operators:', error);
        }
    };
    
    // Load assigned shipments for operators
    const loadAssignedShipments = async () => {
        setAssignedLoading(true);
        setAssignedError(null);
        try {
            const response = await outboundAPI.getAssignedShipments();
            if (response.data.success) {
                setAssignedShipments(response.data.shipments);
            }
        } catch (error) {
            console.error('Failed to load assigned shipments:', error);
            setAssignedError(error.response?.data?.error || 'Failed to load assigned shipments');
        } finally {
            setAssignedLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    // Load bin packages
    const handleLoadBin = async () => {
        if (!binId.trim()) {
            setError('Please enter a bin ID');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await api.post('/outbound/get_bin_packages/', {
                bin_id: binId.trim().toUpperCase()
            });

            if (response.data.success) {
                setBinInfo(response.data.bin);
                setPackages(response.data.packages);
                setMessage(`Loaded ${response.data.package_count} shipments from bin ${binId}`);
            }
        } catch (error) {
            console.error('Load bin error:', error);
            setError(error.response?.data?.errors?.bin_id?.[0] || 'Failed to load bin packages');
            setPackages([]);
            setBinInfo(null);
        } finally {
            setLoading(false);
        }
    };

    // Open pickup modal
    const handleOpenPickupModal = (pkg) => {
        if (pkg.status === 'picked') {
            return; // Already picked
        }
        setCurrentPickupPackage(pkg);
        setScannedTrackingId('');
        setPickupError(null);
        setShowPickupModal(true);
    };

    // Confirm pickup
    const handleConfirmPickup = async () => {
        if (!scannedTrackingId.trim()) {
            setPickupError('Please scan or enter the tracking ID');
            return;
        }

        try {
            const response = await api.post('/outbound/pickup_package/', {
                tracking_id: scannedTrackingId.trim().toUpperCase(),
                expected_tracking_id: currentPickupPackage.tracking_id
            });

            if (response.data.success) {
                // Update package status in the list
                setPackages(packages.map(pkg => 
                    pkg.tracking_id === currentPickupPackage.tracking_id
                        ? { ...pkg, status: 'picked' }
                        : pkg
                ));
                setShowPickupModal(false);
                setMessage(`✓ Shipment ${currentPickupPackage.tracking_id} picked successfully`);
            }
        } catch (error) {
            console.error('Pickup error:', error);
            if (error.response?.data?.mismatch) {
                setPickupError('❌ Tracking ID mismatch! Please scan the correct shipment.');
            } else {
                setPickupError(error.response?.data?.errors?.tracking_id?.[0] || 'Failed to pickup shipment');
            }
        }
    };

    // Open dispatch modal
    const handleOpenDispatchModal = () => {
        const pickedCount = packages.filter(pkg => pkg.status === 'picked').length;
        if (pickedCount === 0) {
            setError('No shipments picked. Please pick up shipments before dispatching.');
            return;
        }
        setScannedDispatchBinId('');
        setDispatchError(null);
        setShowDispatchModal(true);
    };

    // Confirm dispatch
    const handleConfirmDispatch = async () => {
        if (!scannedDispatchBinId.trim()) {
            setDispatchError('Please scan or enter the bin ID');
            return;
        }

        try {
            const response = await api.post('/outbound/dispatch_packages/', {
                bin_id: scannedDispatchBinId.trim().toUpperCase(),
                expected_bin_id: binId.trim().toUpperCase()
            });

            if (response.data.success) {
                setShowDispatchModal(false);
                setMessage(`✓ Successfully dispatched ${response.data.dispatched_count} shipments from bin ${binId}`);
                
                // Remove dispatched packages from list
                setPackages(packages.filter(pkg => pkg.status !== 'picked'));
                
                // If all packages dispatched, reset
                if (packages.filter(pkg => pkg.status !== 'picked').length === 0) {
                    setTimeout(() => {
                        handleReset();
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Dispatch error:', error);
            if (error.response?.data?.mismatch) {
                setDispatchError('❌ Bin ID mismatch! Please scan the correct bin.');
            } else {
                setDispatchError(error.response?.data?.errors?.bin_id?.[0] || 'Failed to dispatch shipments');
            }
        }
    };

    // Reset for new bin
    const handleReset = () => {
        setBinId('');
        setPackages([]);
        setBinInfo(null);
        setError(null);
        setMessage(null);
    };

    // File-based pickup handlers
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileLoading(true);
        setFileError(null);
        setFileMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/outbound/process_picklist_file/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setFilePackages(response.data.packages.map(pkg => ({
                    ...pkg,
                    dispatched: false
                })));
                setFileMessage(`✓ Processed ${response.data.packages.length} shipments from file`);
                setUploadedFile(file);
            }
        } catch (error) {
            console.error('File upload error:', error);
            setFileError(error.response?.data?.error || 'Failed to process file');
        } finally {
            setFileLoading(false);
        }
    };

    const handleFileReset = () => {
        setUploadedFile(null);
        setFilePackages([]);
        setFileError(null);
        setFileMessage(null);
        document.getElementById('fileInput').value = '';
    };
    
    // Handle assigned shipment dispatch
    const handleOpenAssignedDispatchModal = (shipment) => {
        setCurrentAssignedShipment(shipment);
        setScannedAssignedTrackingId('');
        setAssignedDispatchError(null);
        setShowAssignedDispatchModal(true);
    };
    
    const handleConfirmAssignedDispatch = async () => {
        if (!scannedAssignedTrackingId.trim()) {
            setAssignedDispatchError('Please scan or enter the tracking ID');
            return;
        }
        
        if (scannedAssignedTrackingId.trim().toUpperCase() !== currentAssignedShipment.tracking_id) {
            setAssignedDispatchError('❌ Tracking ID mismatch! Please scan the correct shipment.');
            return;
        }
        
        try {
            const response = await outboundAPI.dispatchAssignedShipment(
                currentAssignedShipment.tracking_id,
                scannedAssignedTrackingId
            );
            
            if (response.data.success) {
                setAssignedMessage(response.data.message);
                setShowAssignedDispatchModal(false);
                setScannedAssignedTrackingId('');
                
                // Refresh assigned shipments list
                await loadAssignedShipments();
                
                setTimeout(() => setAssignedMessage(null), 3000);
            }
        } catch (error) {
            console.error('Dispatch error:', error);
            setAssignedDispatchError(error.response?.data?.error || 'Failed to dispatch shipment');
        }
    };
    
    // Handle operator assignment
    const handleOpenAssignModal = () => {
        setShowAssignModal(true);
        setSelectedOperator(null);
    };
    
    const handleAssignToOperator = async () => {
        if (!selectedOperator) {
            alert('Please select an operator');
            return;
        }
        
        setAssignmentLoading(true);
        setFileError(null); // Clear any previous errors
        setFileMessage(null); // Clear any previous messages
        
        try {
            const trackingIds = filePackages.map(pkg => pkg.tracking_id);
            
            let response;
            let isAutoAssign = false;
            
            if (selectedOperator === 'auto') {
                // Auto-assign mode
                isAutoAssign = true;
                response = await outboundAPI.assignToOperator(trackingIds, 'auto');
                
                console.log('Auto-assign response:', response.data);
                
                if (response.data.success) {
                    const summary = response.data.assignments_summary;
                    const summaryLines = Object.entries(summary)
                        .map(([username, count]) => `  • ${username}: ${count} shipment${count > 1 ? 's' : ''}`)
                        .join('\n');
                    
                    const message = `✓ Auto-assigned ${response.data.assigned_count} shipments\n\nDistribution:\n${summaryLines}`;
                    console.log('Setting message:', message);
                    setFileMessage(message);
                    
                    // Auto-dismiss after 6 seconds for auto-assign
                    setTimeout(() => {
                        setFileMessage(null);
                    }, 6000);
                }
            } else {
                // Manual assignment to specific operator
                response = await outboundAPI.assignToOperator(trackingIds, selectedOperator);
                
                if (response.data.success) {
                    setFileMessage(`✓ Successfully assigned ${response.data.assigned_count} shipments to ${response.data.operator.name}`);
                    
                    // Auto-dismiss after 3 seconds for manual assign
                    setTimeout(() => {
                        setFileMessage(null);
                    }, 3000);
                }
            }
            
            if (response.data.success) {
                setShowAssignModal(false);
                
                // Update packages to show they're assigned with picklist-created status
                if (isAutoAssign) {
                    // For auto-assign, mark as assigned with picklist-created status
                    setFilePackages(filePackages.map(pkg => ({
                        ...pkg,
                        status: 'picklist-created',
                        assigned: true,
                        assigned_operator: { username: 'Auto-assigned' }
                    })));
                } else {
                    // For manual assign, set the specific operator with picklist-created status
                    setFilePackages(filePackages.map(pkg => ({
                        ...pkg,
                        status: 'picklist-created',
                        assigned: true,
                        assigned_operator: response.data.operator
                    })));
                }
            }
        } catch (error) {
            console.error('Assignment error:', error);
            setFileError(error.response?.data?.error || 'Failed to assign shipments to operator');
        } finally {
            setAssignmentLoading(false);
        }
    };

    // Scanner handlers
    const handleBinScan = async (scannedValue) => {
        const scannedBinId = scannedValue.toUpperCase();
        setBinId(scannedBinId);
        setShowBinScanner(false);
        
        // Auto-load packages after scan
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await api.post('/outbound/get_bin_packages/', {
                bin_id: scannedBinId
            });

            if (response.data.success) {
                setBinInfo(response.data.bin);
                setPackages(response.data.packages);
                setMessage(`Loaded ${response.data.package_count} shipments from bin ${scannedBinId}`);
            }
        } catch (error) {
            console.error('Load bin error:', error);
            setError(error.response?.data?.errors?.bin_id?.[0] || 'Failed to load bin shipments');
            setPackages([]);
            setBinInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePickupScan = async (scannedValue) => {
        const scannedId = scannedValue.toUpperCase();
        setScannedTrackingId(scannedId);
        setShowPickupScanner(false);
        
        // Auto-confirm pickup after scan
        try {
            const response = await api.post('/outbound/pickup_package/', {
                tracking_id: scannedId,
                expected_tracking_id: currentPickupPackage.tracking_id
            });

            if (response.data.success) {
                // Update package status in the list
                setPackages(packages.map(pkg => 
                    pkg.tracking_id === currentPickupPackage.tracking_id
                        ? { ...pkg, status: 'picked' }
                        : pkg
                ));
                setShowPickupModal(false);
                setMessage(`✓ Shipment ${currentPickupPackage.tracking_id} picked successfully`);
            }
        } catch (error) {
            console.error('Pickup error:', error);
            if (error.response?.data?.mismatch) {
                setPickupError('❌ Tracking ID mismatch! Please scan the correct shipment.');
            } else {
                setPickupError(error.response?.data?.errors?.tracking_id?.[0] || 'Failed to pickup shipment');
            }
        }
    };

    const handleDispatchScan = async (scannedValue) => {
        const scannedId = scannedValue.toUpperCase();
        setScannedDispatchBinId(scannedId);
        setShowDispatchScanner(false);
        
        // Auto-confirm dispatch after scan
        try {
            const response = await api.post('/outbound/dispatch_packages/', {
                bin_id: scannedId,
                expected_bin_id: binId.trim().toUpperCase()
            });

            if (response.data.success) {
                setShowDispatchModal(false);
                setMessage(`✓ Successfully dispatched ${response.data.dispatched_count} packages from bin ${binId}`);
                
                // Remove dispatched packages from list
                setPackages(packages.filter(pkg => pkg.status !== 'picked'));
                
                // If all packages dispatched, reset
                if (packages.filter(pkg => pkg.status !== 'picked').length === 0) {
                    setTimeout(() => {
                        handleReset();
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Dispatch error:', error);
            if (error.response?.data?.mismatch) {
                setDispatchError('❌ Bin ID mismatch! Please scan the correct bin.');
            } else {
                setDispatchError(error.response?.data?.errors?.bin_id?.[0] || 'Failed to dispatch packages');
            }
        }
    };
    
    // Bulk scanning handlers
    const handleOpenBulkScanModal = () => {
        setShowBulkScanModal(true);
        setBulkScanTrackingId('');
        setBulkScanError(null);
        setBulkScanSuccess(null);
    };
    
    const handleBulkScanPickup = async () => {
        const scannedId = bulkScanTrackingId.trim().toUpperCase();
        
        if (!scannedId) {
            setBulkScanError('Please scan or enter a tracking ID');
            return;
        }
        
        // Check if tracking ID exists in current bin packages
        const packageInBin = packages.find(pkg => pkg.tracking_id === scannedId);
        
        if (!packageInBin) {
            setBulkScanError(`❌ Tracking ID ${scannedId} not found in this bin`);
            setBulkScanTrackingId('');
            return;
        }
        
        // Check if already picked
        if (packageInBin.status === 'picked') {
            setBulkScanError(`⚠️ ${scannedId} already picked`);
            setBulkScanTrackingId('');
            return;
        }
        
        // Check if assigned to another operator
        if (packageInBin.assigned_operator && packageInBin.assigned_operator.id !== user?.id) {
            const operatorName = packageInBin.assigned_operator.name || packageInBin.assigned_operator.username;
            setBulkScanError(`🔒 ${scannedId} is assigned to ${operatorName}`);
            setBulkScanTrackingId('');
            return;
        }
        
        try {
            const response = await api.post('/outbound/pickup_package/', {
                tracking_id: scannedId,
                expected_tracking_id: scannedId
            });
            
            if (response.data.success) {
                // Update package status in the list
                setPackages(packages.map(pkg => 
                    pkg.tracking_id === scannedId 
                        ? { ...pkg, status: 'picked' }
                        : pkg
                ));
                
                setBulkScanSuccess(`✓ ${scannedId} picked successfully`);
                setBulkScanError(null);
                setBulkScanTrackingId('');
                
                // Auto-clear success message after 2 seconds
                setTimeout(() => {
                    setBulkScanSuccess(null);
                }, 2000);
            }
        } catch (error) {
            console.error('Pickup error:', error);
            setBulkScanError(error.response?.data?.errors?.tracking_id?.[0] || 'Failed to pick up package');
            setBulkScanTrackingId('');
        }
    };

    const pickedCount = packages.filter(pkg => pkg.status === 'picked').length;
    const totalCount = packages.length;

    return (
        <div className="outbound-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={handleBack}>
                            ← Back
                        </button>
                        {user?.role !== 'OPERATOR' && (
                            <button className="dashboard-btn" onClick={() => navigate('/inventory-dashboard')}>
                                📊 Dashboard
                            </button>
                        )}
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
            <div className="outbound-content">
                {/* Assigned Shipments Section for Operators */}
                {user?.role === 'OPERATOR' && (
                    <div className="assigned-shipments-section">
                        <div className="assigned-card">
                            <div className="card-header">
                                <h2>📋 My Assigned Shipments</h2>
                                <p>Shipments assigned to you for dispatch</p>
                            </div>
                            
                            <div className="card-body">
                                {assignedLoading ? (
                                    <div className="loading-message">Loading assigned shipments...</div>
                                ) : assignedError ? (
                                    <div className="error-box">{assignedError}</div>
                                ) : assignedShipments.length === 0 ? (
                                    <div className="empty-state">
                                        <p>✓ No shipments assigned to you at the moment</p>
                                    </div>
                                ) : (
                                    <>
                                        {assignedMessage && (
                                            <div className="success-box">{assignedMessage}</div>
                                        )}
                                        <div className="assigned-stats">
                                            <span className="stat-badge">
                                                Total Assigned: <strong>{assignedShipments.length}</strong>
                                            </span>
                                        </div>
                                        <div className="table-container">
                                            <table className="packages-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Tracking ID</th>
                                                        <th>Bin ID</th>
                                                        <th>Bin Location</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {assignedShipments.map((shipment, index) => (
                                                        <tr key={shipment.tracking_id}>
                                                            <td>{index + 1}</td>
                                                            <td className="tracking-cell">{shipment.tracking_id}</td>
                                                            <td><strong>{shipment.bin_id || 'N/A'}</strong></td>
                                                            <td>{shipment.bin_location || 'N/A'}</td>
                                                            <td>
                                                                <span className={`status-badge ${shipment.status}`}>
                                                                    {shipment.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="dispatch-button"
                                                                    onClick={() => handleOpenAssignedDispatchModal(shipment)}
                                                                >
                                                                    🚚 Dispatch
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="outbound-card">
                    <div className="card-header">
                        <h2>🚚 Outbound Process - Shipment Pickup</h2>
                        <p>Pick up shipments by bin {user?.role !== 'OPERATOR' && 'or from file'}</p>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button 
                            className={`tab-button ${activeTab === 'bin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bin')}
                        >
                            📦 Pickup by Bin
                        </button>
                        {user?.role !== 'OPERATOR' && (
                            <button 
                                className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
                                onClick={() => setActiveTab('file')}
                            >
                                📄 Pickup by File
                            </button>
                        )}
                    </div>

                    <div className="card-body">
                        {activeTab === 'bin' && (
                            <>
                        {/* Bin Input Section */}
                        <div className="bin-input-section">
                            <h3>Scan or Enter Bin ID</h3>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter Bin ID (e.g., L1R1B01)"
                                    value={binId}
                                    onChange={(e) => setBinId(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && binId.trim()) {
                                            handleLoadBin();
                                        }
                                    }}
                                    disabled={loading || packages.length > 0}
                                />
                                <button 
                                    className="scan-button"
                                    onClick={() => setShowBinScanner(true)}
                                    disabled={loading || packages.length > 0}
                                >
                                    📷 Scan
                                </button>
                                <button 
                                    className="action-button"
                                    onClick={handleLoadBin}
                                    disabled={loading || packages.length > 0}
                                >
                                    {loading ? '⏳ Loading...' : '📦 Load Shipments'}
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="error-box">
                                ⚠️ {error}
                            </div>
                        )}

                        {message && (
                            <div className="success-box">
                                {message}
                            </div>
                        )}

                        {/* Bin Info and Packages */}
                        {binInfo && packages.length > 0 && (
                            <div className="packages-section">
                                <div className="bin-info-header">
                                    <div className="bin-details">
                                        <h3>📍 Bin: {binInfo.bin_id}</h3>
                                        <p>Location: {binInfo.location}</p>
                                        <p>Progress: {pickedCount}/{totalCount} shipments picked</p>
                                    </div>
                                    <div className="action-buttons">
                                        <button 
                                            className="bulk-scan-button"
                                            onClick={handleOpenBulkScanModal}
                                        >
                                            📱 Start Scanning
                                        </button>
                                        <button 
                                            className="dispatch-button"
                                            onClick={handleOpenDispatchModal}
                                            disabled={pickedCount === 0}
                                        >
                                            🚚 Dispatch ({pickedCount})
                                        </button>
                                        <button 
                                            className="reset-button"
                                            onClick={handleReset}
                                        >
                                            🔄 New Bin
                                        </button>
                                    </div>
                                </div>

                                <div className="packages-list">
                                    <table className="packages-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tracking ID</th>
                                                <th>Source</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {packages.map((pkg, index) => (
                                                <tr 
                                                    key={pkg.tracking_id}
                                                    className={`
                                                        ${pkg.status === 'picked' ? 'picked-row' : ''}
                                                        ${pkg.assigned_operator && pkg.assigned_operator.id !== user?.id ? 'assigned-to-other' : ''}
                                                    `.trim()}
                                                    title={pkg.assigned_operator && pkg.assigned_operator.id !== user?.id 
                                                        ? `Assigned to ${pkg.assigned_operator.name || pkg.assigned_operator.username}`
                                                        : ''}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td className="tracking-cell">{pkg.tracking_id}</td>
                                                    <td>{pkg.manifested ? '📋 Manifest' : '🆕 New'}</td>
                                                    <td>
                                                        <span className={`status-badge ${pkg.status}`}>
                                                            {pkg.status === 'picked' ? '✓ Picked' : pkg.status}
                                                        </span>
                                                        {pkg.assigned_operator && (
                                                            <span className="operator-badge">
                                                                👤 {pkg.assigned_operator.username}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {pkg.status === 'picked' ? (
                                                            <span className="picked-indicator">✓ Ready</span>
                                                        ) : pkg.assigned_operator && pkg.assigned_operator.id !== user?.id ? (
                                                            <button 
                                                                className="pickup-button disabled"
                                                                disabled
                                                                title={`Assigned to ${pkg.assigned_operator.name || pkg.assigned_operator.username}`}
                                                            >
                                                                🔒 Restricted
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="pickup-button"
                                                                onClick={() => handleOpenPickupModal(pkg)}
                                                            >
                                                                📦 Pick Up
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {binInfo && packages.length === 0 && (
                            <div className="empty-bin-message">
                                <p>No shipments found in this bin</p>
                                <button className="reset-button" onClick={handleReset}>
                                    Try Another Bin
                                </button>
                            </div>
                        )}
                            </>
                        )}

                        {activeTab === 'file' && (
                            <>
                        {/* File Upload Section */}
                        <div className="file-upload-section">
                            <h3>Upload Picklist File</h3>
                            <p className="file-instructions">
                                Upload a CSV or JSON file containing tracking IDs to create a picklist
                            </p>
                            
                            <div className="file-input-group">
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept=".csv,.json"
                                    onChange={handleFileUpload}
                                    disabled={fileLoading || filePackages.length > 0}
                                    style={{ display: 'none' }}
                                />
                                <label 
                                    htmlFor="fileInput" 
                                    className={`file-input-label ${fileLoading || filePackages.length > 0 ? 'disabled' : ''}`}
                                >
                                    📁 {uploadedFile ? uploadedFile.name : 'Choose File'}
                                </label>
                                {filePackages.length > 0 && (
                                    <button className="reset-button" onClick={handleFileReset}>
                                        🔄 Upload New File
                                    </button>
                                )}
                            </div>

                            {fileLoading && (
                                <div className="loading-message">
                                    ⏳ Processing file...
                                </div>
                            )}
                        </div>

                        {/* File Messages */}
                        {fileError && (
                            <div className="error-box">
                                ⚠️ {fileError}
                            </div>
                        )}

                        {fileMessage && (
                            <div className="success-box">
                                {fileMessage}
                            </div>
                        )}

                        {/* File Packages List */}
                        {filePackages.length > 0 && (
                            <div className="packages-section">
                                <div className="file-packages-header">
                                    <h3>📋 Picklist Packages</h3>
                                    <div className="header-actions">
                                        <p>
                                            {filePackages.filter(pkg => pkg.assigned).length} / {filePackages.length} assigned
                                        </p>
                                        {filePackages.some(pkg => !pkg.assigned) && (
                                            <button 
                                                className="assign-operator-button"
                                                onClick={handleOpenAssignModal}
                                            >
                                                👤 Assign to Operator
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="packages-list">
                                    <table className="packages-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tracking ID</th>
                                                <th>Bin ID</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filePackages.map((pkg, index) => (
                                                <tr 
                                                    key={pkg.tracking_id}
                                                    className={pkg.assigned ? 'assigned-row' : ''}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td className="tracking-cell">{pkg.tracking_id}</td>
                                                    <td>{pkg.bin_id || 'N/A'}</td>
                                                    <td>
                                                        <span className={`status-badge ${pkg.status || 'putaway'}`}>
                                                            {pkg.status === 'picklist-created' ? '📋 Picklist Created' : 
                                                             pkg.status === 'picked' ? '✓ Picked' : 
                                                             pkg.manifested ? '📋 Manifested' : '🆕 Direct'}
                                                        </span>
                                                        {pkg.assigned_operator && (
                                                            <span className="operator-badge">
                                                                👤 {pkg.assigned_operator.username}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Pickup Modal */}
            {showPickupModal && (
                <div className="modal-overlay" onClick={() => setShowPickupModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Package Pickup</h3>
                            <button className="close-button" onClick={() => setShowPickupModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-instruction">
                                Please scan or enter tracking ID to confirm:
                            </p>
                            <p className="expected-value">
                                <strong>Expected: {currentPickupPackage?.tracking_id}</strong>
                            </p>
                            
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Scan or enter Tracking ID"
                                    value={scannedTrackingId}
                                    onChange={(e) => setScannedTrackingId(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && scannedTrackingId.trim()) {
                                            handleConfirmPickup();
                                        }
                                    }}
                                    autoFocus
                                />
                                <button 
                                    className="scan-button"
                                    onClick={() => setShowPickupScanner(true)}
                                >
                                    📷 Scan
                                </button>
                            </div>

                            {pickupError && (
                                <div className="error-box">
                                    {pickupError}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowPickupModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-button" onClick={handleConfirmPickup}>
                                ✓ Confirm Pickup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispatch Modal */}
            {showDispatchModal && (
                <div className="modal-overlay" onClick={() => setShowDispatchModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Dispatch</h3>
                            <button className="close-button" onClick={() => setShowDispatchModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-instruction">
                                Please scan or enter bin ID to confirm dispatch:
                            </p>
                            <p className="expected-value">
                                <strong>Expected: {binId}</strong>
                            </p>
                            <p className="dispatch-info">
                                Dispatching <strong>{pickedCount}</strong> picked packages
                            </p>
                            
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Scan or enter Bin ID"
                                    value={scannedDispatchBinId}
                                    onChange={(e) => setScannedDispatchBinId(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && scannedDispatchBinId.trim()) {
                                            handleConfirmDispatch();
                                        }
                                    }}
                                    autoFocus
                                />
                                <button 
                                    className="scan-button"
                                    onClick={() => setShowDispatchScanner(true)}
                                >
                                    📷 Scan
                                </button>
                            </div>

                            {dispatchError && (
                                <div className="error-box">
                                    {dispatchError}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowDispatchModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-button" onClick={handleConfirmDispatch}>
                                🚚 Confirm Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Assigned Shipment Dispatch Modal */}
            {showAssignedDispatchModal && (
                <div className="modal-overlay" onClick={() => setShowAssignedDispatchModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Shipment Dispatch</h3>
                            <button className="close-button" onClick={() => setShowAssignedDispatchModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-instruction">
                                Please scan or enter tracking ID to confirm dispatch:
                            </p>
                            <p className="expected-value">
                                <strong>Expected: {currentAssignedShipment?.tracking_id}</strong>
                            </p>
                            <p className="dispatch-info">
                                Bin: <strong>{currentAssignedShipment?.bin_id || 'N/A'}</strong> | 
                                Location: <strong>{currentAssignedShipment?.bin_location || 'N/A'}</strong>
                            </p>
                            
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Scan or enter Tracking ID"
                                    value={scannedAssignedTrackingId}
                                    onChange={(e) => setScannedAssignedTrackingId(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && scannedAssignedTrackingId.trim()) {
                                            handleConfirmAssignedDispatch();
                                        }
                                    }}
                                    autoFocus
                                />
                                <button 
                                    className="scan-button"
                                    onClick={() => setShowAssignedDispatchScanner(true)}
                                >
                                    📷 Scan
                                </button>
                            </div>

                            {assignedDispatchError && (
                                <div className="error-box">
                                    {assignedDispatchError}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowAssignedDispatchModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-button" onClick={handleConfirmAssignedDispatch}>
                                🚚 Confirm Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* File Dispatch Modal */}
            {/* Assign to Operator Modal */}
            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Assign to Operator</h3>
                            <button className="close-button" onClick={() => setShowAssignModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-instruction">
                                Select an operator to assign {filePackages.length} shipments:
                            </p>
                            
                            <div className="operator-selection">
                                {operators.length === 0 ? (
                                    <p className="no-operators">No operators available for this warehouse</p>
                                ) : (
                                    <>
                                        {/* Auto Assignment Option */}
                                        <div 
                                            className={`operator-card auto-card ${selectedOperator === 'auto' ? 'selected' : ''}`}
                                            onClick={() => setSelectedOperator('auto')}
                                        >
                                            <div className="operator-avatar auto-avatar">
                                                🔄
                                            </div>
                                            <div className="operator-info">
                                                <div className="operator-name">Auto Assign</div>
                                            </div>
                                            {selectedOperator === 'auto' && (
                                                <div className="selected-indicator">✓</div>
                                            )}
                                        </div>
                                        
                                        {/* Individual Operators */}
                                        {operators.map((operator) => (
                                            <div 
                                                key={operator.id}
                                                className={`operator-card ${selectedOperator === operator.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedOperator(operator.id)}
                                            >
                                                <div className="operator-avatar">
                                                    {operator.first_name?.charAt(0) || operator.username.charAt(0)}
                                                </div>
                                                <div className="operator-info">
                                                    <div className="operator-name">
                                                        {operator.first_name && operator.last_name 
                                                            ? `${operator.first_name} ${operator.last_name}`
                                                            : operator.username}
                                                    </div>
                                                    <div className="operator-username">@{operator.username}</div>
                                                </div>
                                                {selectedOperator === operator.id && (
                                                    <div className="selected-indicator">✓</div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowAssignModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="confirm-button" 
                                onClick={handleAssignToOperator}
                                disabled={!selectedOperator || assignmentLoading}
                            >
                                {assignmentLoading ? '⏳ Assigning...' : '✓ Confirm Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Scanning Modal */}
            {showBulkScanModal && (
                <div className="modal-overlay" onClick={() => setShowBulkScanModal(false)}>
                    <div className="modal-content bulk-scan-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📱 Bulk Package Scanning</h3>
                            <button className="close-button" onClick={() => setShowBulkScanModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="scan-progress">
                                <div className="progress-info">
                                    <span className="progress-label">Progress:</span>
                                    <span className="progress-count">{pickedCount} / {totalCount} picked</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div 
                                        className="progress-bar-fill" 
                                        style={{ width: `${(pickedCount / totalCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <p className="modal-instruction">
                                Scan or enter tracking IDs to pick up packages:
                            </p>
                            
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Scan or enter Tracking ID"
                                    value={bulkScanTrackingId}
                                    onChange={(e) => setBulkScanTrackingId(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && bulkScanTrackingId.trim()) {
                                            handleBulkScanPickup();
                                        }
                                    }}
                                    autoFocus
                                />
                                <button 
                                    className="scan-button"
                                    onClick={() => setShowBulkScanner(true)}
                                >
                                    📷 Scan
                                </button>
                            </div>

                            {bulkScanError && (
                                <div className="error-box">
                                    {bulkScanError}
                                </div>
                            )}
                            
                            {bulkScanSuccess && (
                                <div className="success-box">
                                    {bulkScanSuccess}
                                </div>
                            )}
                            
                            <div className="bulk-scan-info">
                                <p>💡 Tip: Keep scanning packages continuously. Press ESC or click Cancel to finish.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowBulkScanModal(false)}>
                                Done
                            </button>
                            <button className="confirm-button" onClick={handleBulkScanPickup}>
                                ✓ Confirm Pickup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanners */}
            {showBinScanner && (
                <BarcodeScanner 
                    onScanSuccess={handleBinScan}
                    onClose={() => setShowBinScanner(false)}
                    scannerType="Bin ID"
                />
            )}

            {showPickupScanner && (
                <BarcodeScanner 
                    onScanSuccess={handlePickupScan}
                    onClose={() => setShowPickupScanner(false)}
                    scannerType="Tracking ID"
                />
            )}

            {showDispatchScanner && (
                <BarcodeScanner 
                    onScanSuccess={handleDispatchScan}
                    onClose={() => setShowDispatchScanner(false)}
                    scannerType="Bin ID"
                />
            )}
            
            {showAssignedDispatchScanner && (
                <BarcodeScanner 
                    onScanSuccess={(scannedValue) => {
                        setScannedAssignedTrackingId(scannedValue.toUpperCase());
                        setShowAssignedDispatchScanner(false);
                    }}
                    onClose={() => setShowAssignedDispatchScanner(false)}
                    scannerType="Tracking ID"
                />
            )}
            
            {showBulkScanner && (
                <BarcodeScanner 
                    onScanSuccess={(scannedValue) => {
                        setBulkScanTrackingId(scannedValue.toUpperCase());
                        setShowBulkScanner(false);
                        // Auto-trigger pickup after scan
                        setTimeout(() => {
                            handleBulkScanPickup();
                        }, 100);
                    }}
                    onClose={() => setShowBulkScanner(false)}
                    scannerType="Tracking ID"
                />
            )}
        </div>
    );
};

export default OutboundProcess;
