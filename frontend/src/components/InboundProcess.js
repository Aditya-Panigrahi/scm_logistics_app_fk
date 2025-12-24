import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { inboundAPI } from '../services/api';
import BarcodeScanner from './BarcodeScanner';
import './InboundProcess.css';

const InboundProcess = () => {
    const navigate = useNavigate();
    const [binId, setBinId] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [binValidated, setBinValidated] = useState(false);
    const [binLocked, setBinLocked] = useState(false);
    const [binCapacity, setBinCapacity] = useState({ used: 0, total: 0 });
    const [assignedPackages, setAssignedPackages] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // success, error, info, warning
    const [showBinScanner, setShowBinScanner] = useState(false);
    const [showPackageScanner, setShowPackageScanner] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAutoValidateBin = useCallback(async () => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        setMessage('');
        
        try {
            const response = await inboundAPI.scanBin(binId);
            if (response.data.success) {
                setBinValidated(true);
                setBinLocked(true);
                setMessage(`✓ Bin ${binId} validated and locked. Ready to scan packages.`);
                setMessageType('success');
                
                // Get bin capacity
                if (response.data.bin) {
                    setBinCapacity({ used: 0, total: response.data.bin.capacity });
                }
            }
        } catch (error) {
            setMessage(error.response?.data?.errors?.bin_id?.[0] || 'Failed to validate bin');
            setMessageType('error');
            setBinValidated(false);
        } finally {
            setIsProcessing(false);
        }
    }, [binId, isProcessing]);

    // Auto-validate bin when binId changes (must be exactly 7 characters)
    useEffect(() => {
        if (binId && binId.length === 7 && !binLocked) {
            const timer = setTimeout(() => {
                handleAutoValidateBin();
            }, 500); // Debounce 500ms
            
            return () => clearTimeout(timer);
        }
    }, [binId, binLocked, handleAutoValidateBin]);

    const handleAssignPackage = async () => {
        if (!binValidated || !trackingId) {
            setMessage('Please enter a tracking ID');
            setMessageType('error');
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);
        setMessage('');

        try {
            const response = await inboundAPI.assignPackage(binId, trackingId);
            if (response.data.success) {
                const newPackage = {
                    tracking_id: response.data.shipment.tracking_id,
                    status: response.data.shipment.status,
                    was_manifested: response.data.was_manifested,
                    time: new Date().toLocaleTimeString()
                };
                
                setAssignedPackages([...assignedPackages, newPackage]);
                setBinCapacity({
                    used: response.data.bin_capacity_used,
                    total: response.data.bin_capacity_total
                });
                
                // Check if bin is at capacity
                if (response.data.bin_capacity_used >= response.data.bin_capacity_total) {
                    setMessage(`✓ Package assigned! BIN FULL (${response.data.bin_capacity_used}/${response.data.bin_capacity_total})`);
                    setMessageType('warning');
                } else {
                    setMessage(`✓ Package ${trackingId} assigned! (${response.data.bin_capacity_used}/${response.data.bin_capacity_total})`);
                    setMessageType('success');
                }
                
                // Clear tracking ID for next scan
                setTrackingId('');
                
                // Focus back on tracking input
                setTimeout(() => {
                    document.getElementById('trackingId')?.focus();
                }, 100);
            }
        } catch (error) {
            if (error.response?.data?.capacity_exceeded) {
                setMessage(`⚠️ Bin ${binId} is at full capacity! Cannot assign more packages.`);
                setMessageType('warning');
            } else {
                setMessage(error.response?.data?.errors?.bin_id?.[0] || error.response?.data?.errors?.non_field_errors?.[0] || 'Failed to assign package');
                setMessageType('error');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTrackingKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAssignPackage();
        }
    };

    const handleUnlockBin = () => {
        setBinId('');
        setBinValidated(false);
        setBinLocked(false);
        setBinCapacity({ used: 0, total: 0 });
        setAssignedPackages([]);
        setMessage('');
        setTrackingId('');
    };

    const resetForm = () => {
        setBinId('');
        setTrackingId('');
        setBinValidated(false);
        setBinLocked(false);
        setBinCapacity({ used: 0, total: 0 });
        setAssignedPackages([]);
        setMessage('');
        setMessageType('');
    };

    const handleBinScanSuccess = (decodedText) => {
        setBinId(decodedText.toUpperCase());
        setShowBinScanner(false);
    };

    const handlePackageScanSuccess = (decodedText) => {
        setTrackingId(decodedText.toUpperCase());
        setShowPackageScanner(false);
        // Auto-assign after scanning
        setTimeout(() => {
            document.getElementById('assignBtn')?.click();
        }, 200);
    };

    return (
        <div className="inbound-container">
            <div className="header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/')}>
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

            <div className="content-wrapper">
                <h1 className="page-title">Inbound Process - Package Putaway</h1>
            
            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <div className="process-steps">
                {/* Step 1: Scan/Enter Bin - Auto-validates */}
                <div className={`step ${binValidated ? 'completed' : ''}`}>
                    <h2>Step 1: Scan or Enter Bin ID</h2>
                    <div className="form-group">
                        <label htmlFor="binId">Bin ID:</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="binId"
                                value={binId}
                                onChange={(e) => setBinId(e.target.value.toUpperCase())}
                                placeholder="Enter Bin ID"
                                required
                                disabled={binLocked}
                                autoFocus={!binLocked}
                            />
                            <button 
                                type="button"
                                className="camera-btn" 
                                onClick={() => setShowBinScanner(true)}
                                disabled={binLocked}
                            >
                                <span className="camera-icon">📷</span>
                                Scan
                            </button>
                            {binLocked && (
                                <button 
                                    type="button"
                                    className="unlock-btn" 
                                    onClick={handleUnlockBin}
                                >
                                    🔓 Change Bin
                                </button>
                            )}
                        </div>
                        {binValidated && (
                            <div className="validation-status success">
                                ✓ Bin locked and ready | Capacity: {binCapacity.used}/{binCapacity.total}
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 2: Scan Packages - Multiple allowed */}
                <div className={`step ${!binValidated ? 'disabled' : ''}`}>
                    <h2>Step 2: Scan or Enter Tracking IDs</h2>
                    <div className="form-group">
                        <label htmlFor="trackingId">Tracking ID:</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="trackingId"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                                onKeyPress={handleTrackingKeyPress}
                                placeholder="Enter Tracking ID"
                                required
                                disabled={!binValidated || binCapacity.used >= binCapacity.total}
                                autoFocus={binValidated}
                            />
                            <button 
                                type="button"
                                className="camera-btn" 
                                onClick={() => setShowPackageScanner(true)}
                                disabled={!binValidated || binCapacity.used >= binCapacity.total}
                            >
                                <span className="camera-icon">📷</span>
                                Scan
                            </button>
                            <button 
                                id="assignBtn"
                                type="button"
                                className="assign-btn-inline" 
                                onClick={handleAssignPackage}
                                disabled={!binValidated || !trackingId || binCapacity.used >= binCapacity.total}
                            >
                                ✓ Assign
                            </button>
                        </div>
                    </div>

                    {/* Assigned Packages List */}
                    {assignedPackages.length > 0 && (
                        <div className="assigned-packages-list">
                            <h3>Assigned Packages ({assignedPackages.length})</h3>
                            <div className="packages-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Tracking ID</th>
                                            <th>Status</th>
                                            <th>Source</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignedPackages.map((pkg, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{pkg.tracking_id}</td>
                                                <td><span className="status-badge putaway">{pkg.status}</span></td>
                                                <td>{pkg.was_manifested ? '📋 Manifest' : '🆕 New'}</td>
                                                <td>{pkg.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="action-buttons">
                <button onClick={resetForm} className="reset-btn">
                    🔄 Start New Bin
                </button>
            </div>
            </div>

            {showBinScanner && (
                <BarcodeScanner 
                    key="bin-scanner"
                    onScanSuccess={handleBinScanSuccess}
                    onClose={() => setShowBinScanner(false)}
                    scannerType="Bin ID"
                />
            )}

            {showPackageScanner && (
                <BarcodeScanner 
                    key="package-scanner"
                    onScanSuccess={handlePackageScanSuccess}
                    onClose={() => setShowPackageScanner(false)}
                    scannerType="Tracking ID"
                />
            )}
        </div>
    );
};

export default InboundProcess;
