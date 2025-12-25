import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OutboundProcess.css';
import BarcodeScanner from './BarcodeScanner';
import api from '../services/api';

const OutboundProcess = () => {
    const navigate = useNavigate();
    
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
    const [showFileDispatchModal, setShowFileDispatchModal] = useState(false);
    const [currentFilePackage, setCurrentFilePackage] = useState(null);
    
    // Current package being picked up
    const [currentPickupPackage, setCurrentPickupPackage] = useState(null);
    const [scannedTrackingId, setScannedTrackingId] = useState('');
    const [pickupError, setPickupError] = useState(null);
    const [showPickupScanner, setShowPickupScanner] = useState(false);
    
    // Dispatch verification
    const [scannedDispatchBinId, setScannedDispatchBinId] = useState('');
    const [dispatchError, setDispatchError] = useState(null);
    const [showDispatchScanner, setShowDispatchScanner] = useState(false);
    const [fileDispatchError, setFileDispatchError] = useState(null);
    const [showFileDispatchScanner, setShowFileDispatchScanner] = useState(false);

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
                setMessage(`Loaded ${response.data.package_count} packages from bin ${binId}`);
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
                setMessage(`✓ Package ${currentPickupPackage.tracking_id} picked successfully`);
            }
        } catch (error) {
            console.error('Pickup error:', error);
            if (error.response?.data?.mismatch) {
                setPickupError('❌ Tracking ID mismatch! Please scan the correct package.');
            } else {
                setPickupError(error.response?.data?.errors?.tracking_id?.[0] || 'Failed to pickup package');
            }
        }
    };

    // Open dispatch modal
    const handleOpenDispatchModal = () => {
        const pickedCount = packages.filter(pkg => pkg.status === 'picked').length;
        if (pickedCount === 0) {
            setError('No packages picked. Please pick up packages before dispatching.');
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
                setFileMessage(`✓ Processed ${response.data.packages.length} packages from file`);
                setUploadedFile(file);
            }
        } catch (error) {
            console.error('File upload error:', error);
            setFileError(error.response?.data?.error || 'Failed to process file');
        } finally {
            setFileLoading(false);
        }
    };

    const handleOpenFileDispatchModal = (pkg) => {
        if (pkg.dispatched) return;
        setCurrentFilePackage(pkg);
        setScannedTrackingId('');
        setFileDispatchError(null);
        setShowFileDispatchModal(true);
    };

    const handleConfirmFileDispatch = async () => {
        if (!scannedTrackingId.trim()) {
            setFileDispatchError('Please scan or enter the tracking ID');
            return;
        }

        if (scannedTrackingId.trim().toUpperCase() !== currentFilePackage.tracking_id) {
            setFileDispatchError('❌ Tracking ID mismatch! Please scan the correct package.');
            return;
        }

        try {
            const response = await api.post('/outbound/dispatch_single_package/', {
                tracking_id: currentFilePackage.tracking_id
            });

            if (response.data.success) {
                // Update package status
                setFilePackages(filePackages.map(pkg => 
                    pkg.tracking_id === currentFilePackage.tracking_id
                        ? { ...pkg, dispatched: true }
                        : pkg
                ));
                setShowFileDispatchModal(false);
                setScannedTrackingId('');
            }
        } catch (error) {
            console.error('Dispatch error:', error);
            setFileDispatchError(error.response?.data?.error || 'Failed to dispatch package');
        }
    };

    const handleFileReset = () => {
        setUploadedFile(null);
        setFilePackages([]);
        setFileError(null);
        setFileMessage(null);
        document.getElementById('fileInput').value = '';
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
                setMessage(`Loaded ${response.data.package_count} packages from bin ${scannedBinId}`);
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
                setMessage(`✓ Package ${currentPickupPackage.tracking_id} picked successfully`);
            }
        } catch (error) {
            console.error('Pickup error:', error);
            if (error.response?.data?.mismatch) {
                setPickupError('❌ Tracking ID mismatch! Please scan the correct package.');
            } else {
                setPickupError(error.response?.data?.errors?.tracking_id?.[0] || 'Failed to pickup package');
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
                        <button className="dashboard-btn" onClick={() => navigate('/inventory-dashboard')}>
                            📊 Dashboard
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
            <div className="outbound-content">
                <div className="outbound-card">
                    <div className="card-header">
                        <h2>🚚 Outbound Process - Package Pickup</h2>
                        <p>Pick up packages by bin or from file</p>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button 
                            className={`tab-button ${activeTab === 'bin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bin')}
                        >
                            📦 Pickup by Bin
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
                            onClick={() => setActiveTab('file')}
                        >
                            📄 Pickup by File
                        </button>
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
                                    {loading ? '⏳ Loading...' : '📦 Load Packages'}
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
                                        <p>Progress: {pickedCount}/{totalCount} packages picked</p>
                                    </div>
                                    <div className="action-buttons">
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
                                                    className={pkg.status === 'picked' ? 'picked-row' : ''}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td className="tracking-cell">{pkg.tracking_id}</td>
                                                    <td>{pkg.manifested ? '📋 Manifest' : '🆕 New'}</td>
                                                    <td>
                                                        <span className={`status-badge ${pkg.status}`}>
                                                            {pkg.status === 'picked' ? '✓ Picked' : pkg.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {pkg.status === 'picked' ? (
                                                            <span className="picked-indicator">✓ Ready</span>
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
                                <p>No packages found in this bin</p>
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
                                    <p>
                                        {filePackages.filter(pkg => pkg.dispatched).length} / {filePackages.length} dispatched
                                    </p>
                                </div>

                                <div className="packages-list">
                                    <table className="packages-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tracking ID</th>
                                                <th>Bin ID</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filePackages.map((pkg, index) => (
                                                <tr 
                                                    key={pkg.tracking_id}
                                                    className={pkg.dispatched ? 'dispatched-row' : ''}
                                                >
                                                    <td>{index + 1}</td>
                                                    <td className="tracking-cell">{pkg.tracking_id}</td>
                                                    <td>{pkg.bin_id || 'N/A'}</td>
                                                    <td>
                                                        <span className={`status-badge ${pkg.dispatched ? 'dispatched' : 'picklist-created'}`}>
                                                            {pkg.dispatched ? '✓ Dispatched' : '📋 Picklist Created'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {pkg.dispatched ? (
                                                            <span className="dispatched-indicator">✓ Done</span>
                                                        ) : (
                                                            <button 
                                                                className="dispatch-single-button"
                                                                onClick={() => handleOpenFileDispatchModal(pkg)}
                                                            >
                                                                🚚 Dispatch
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

            {/* File Dispatch Modal */}
            {showFileDispatchModal && (
                <div className="modal-overlay" onClick={() => setShowFileDispatchModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Package Dispatch</h3>
                            <button className="close-button" onClick={() => setShowFileDispatchModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-instruction">
                                Please scan or enter tracking ID to confirm dispatch:
                            </p>
                            <p className="expected-value">
                                <strong>Expected: {currentFilePackage?.tracking_id}</strong>
                            </p>
                            <p className="dispatch-info">
                                Bin: <strong>{currentFilePackage?.bin_id || 'N/A'}</strong>
                            </p>
                            
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Scan or enter Tracking ID"
                                    value={scannedTrackingId}
                                    onChange={(e) => setScannedTrackingId(e.target.value.toUpperCase())}
                                    autoFocus
                                />
                                <button 
                                    className="scan-button"
                                    onClick={() => setShowFileDispatchScanner(true)}
                                >
                                    📷 Scan
                                </button>
                            </div>

                            {fileDispatchError && (
                                <div className="error-box">
                                    {fileDispatchError}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowFileDispatchModal(false)}>
                                Cancel
                            </button>
                            <button className="confirm-button" onClick={handleConfirmFileDispatch}>
                                🚚 Confirm Dispatch
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

            {showFileDispatchScanner && (
                <BarcodeScanner 
                    onScanSuccess={(scannedValue) => {
                        setScannedTrackingId(scannedValue.toUpperCase());
                        setShowFileDispatchScanner(false);
                    }}
                    onClose={() => setShowFileDispatchScanner(false)}
                    scannerType="Tracking ID"
                />
            )}
        </div>
    );
};

export default OutboundProcess;
