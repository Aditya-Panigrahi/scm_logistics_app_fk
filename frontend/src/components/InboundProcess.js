import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inboundAPI } from '../services/api';
import BarcodeScanner from './BarcodeScanner';
import './InboundProcess.css';

const InboundProcess = () => {
    const navigate = useNavigate();
    const [binId, setBinId] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [binValidated, setBinValidated] = useState(false);
    const [packageValidated, setPackageValidated] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // success, error, info
    const [assignedShipment, setAssignedShipment] = useState(null);
    const [showBinScanner, setShowBinScanner] = useState(false);
    const [showPackageScanner, setShowPackageScanner] = useState(false);

    const handleScanBin = async (e) => {
        e.preventDefault();
        setMessage('');
        
        try {
            const response = await inboundAPI.scanBin(binId);
            if (response.data.success) {
                setBinValidated(true);
                setMessage(response.data.message);
                setMessageType('success');
            }
        } catch (error) {
            setMessage(error.response?.data?.errors?.bin_id?.[0] || 'Failed to validate bin');
            setMessageType('error');
            setBinValidated(false);
        }
    };

    const handleScanPackage = async (e) => {
        e.preventDefault();
        setMessage('');
        
        if (!binValidated) {
            setMessage('Please scan and validate bin first');
            setMessageType('error');
            return;
        }

        try {
            const response = await inboundAPI.scanPackage(trackingId);
            if (response.data.success) {
                setPackageValidated(true);
                setMessage(response.data.message);
                setMessageType('success');
            }
        } catch (error) {
            setMessage(error.response?.data?.errors?.tracking_id?.[0] || 'Failed to validate package');
            setMessageType('error');
            setPackageValidated(false);
        }
    };

    const handleAssign = async () => {
        setMessage('');
        
        if (!binValidated || !packageValidated) {
            setMessage('Please validate both bin and package first');
            setMessageType('error');
            return;
        }

        try {
            const response = await inboundAPI.assignPackage(binId, trackingId);
            if (response.data.success) {
                setAssignedShipment(response.data.shipment);
                setMessage(response.data.message);
                setMessageType('success');
                
                // Reset form
                setTimeout(() => {
                    resetForm();
                }, 2000);
            }
        } catch (error) {
            setMessage(error.response?.data?.errors?.non_field_errors?.[0] || 'Failed to assign package');
            setMessageType('error');
        }
    };

    const resetForm = () => {
        setBinId('');
        setTrackingId('');
        setBinValidated(false);
        setPackageValidated(false);
        setMessage('');
        setMessageType('');
        setAssignedShipment(null);
    };

    const handleBinScanSuccess = (decodedText) => {
        setBinId(decodedText.toUpperCase());
        setShowBinScanner(false);
        setMessage('Bin ID scanned successfully. Click "Validate Bin" to proceed.');
        setMessageType('info');
    };

    const handlePackageScanSuccess = (decodedText) => {
        setTrackingId(decodedText.toUpperCase());
        setShowPackageScanner(false);
        setMessage('Tracking ID scanned successfully. Click "Validate Package" to proceed.');
        setMessageType('info');
    };

    return (
        <div className="inbound-container">
            <div className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <button className="back-btn" onClick={() => navigate('/')}>
                            ← Back
                        </button>
                        <div className="logo">
                            Flipkart
                            <span className="logo-tagline">SCM</span>
                        </div>
                    </div>
                    <div className="header-title">Logistics Management System</div>
                </div>
            </div>

            <div className="content-wrapper">
                <h1 className="page-title">Inbound Process</h1>
            
            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <div className="process-steps">
                {/* Step 1: Scan Bin */}
                <div className={`step ${binValidated ? 'completed' : ''}`}>
                    <h2>Step 1: Scan Bin</h2>
                    <form onSubmit={handleScanBin}>
                        <div className="form-group">
                            <label htmlFor="binId">Bin ID:</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="binId"
                                    value={binId}
                                    onChange={(e) => setBinId(e.target.value.toUpperCase())}
                                    placeholder="Enter or scan Bin ID"
                                    required
                                    disabled={binValidated}
                                />
                                <button 
                                    type="button"
                                    className="camera-btn" 
                                    onClick={() => setShowBinScanner(true)}
                                    disabled={binValidated}
                                >
                                    <span className="camera-icon">📷</span>
                                    Scan
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={binValidated}>
                            {binValidated ? '✓ Bin Validated' : 'Validate Bin'}
                        </button>
                    </form>
                </div>

                {/* Step 2: Scan Package */}
                <div className={`step ${packageValidated ? 'completed' : ''} ${!binValidated ? 'disabled' : ''}`}>
                    <h2>Step 2: Scan Package</h2>
                    <form onSubmit={handleScanPackage}>
                        <div className="form-group">
                            <label htmlFor="trackingId">Tracking ID:</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="trackingId"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                                    placeholder="Enter or scan Tracking ID"
                                    required
                                    disabled={!binValidated || packageValidated}
                                />
                                <button 
                                    type="button"
                                    className="camera-btn" 
                                    onClick={() => setShowPackageScanner(true)}
                                    disabled={!binValidated || packageValidated}
                                >
                                    <span className="camera-icon">📷</span>
                                    Scan
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={!binValidated || packageValidated}>
                            {packageValidated ? '✓ Package Validated' : 'Validate Package'}
                        </button>
                    </form>
                </div>

                {/* Step 3: Assign */}
                <div className={`step ${!binValidated || !packageValidated ? 'disabled' : ''}`}>
                    <h2>Step 3: Assign Package to Bin</h2>
                    <div className="assignment-info">
                        <p><strong>Bin ID:</strong> {binId || 'N/A'}</p>
                        <p><strong>Tracking ID:</strong> {trackingId || 'N/A'}</p>
                    </div>
                    <button 
                        onClick={handleAssign} 
                        disabled={!binValidated || !packageValidated}
                        className="assign-btn"
                    >
                        Assign Package
                    </button>
                </div>
            </div>

            {assignedShipment && (
                <div className="success-panel">
                    <h3>✓ Assignment Successful!</h3>
                    <div className="shipment-details">
                        <p><strong>Tracking ID:</strong> {assignedShipment.tracking_id}</p>
                        <p><strong>Bin ID:</strong> {assignedShipment.bin_id}</p>
                        <p><strong>Status:</strong> {assignedShipment.status}</p>
                        <p><strong>Time In:</strong> {new Date(assignedShipment.time_in).toLocaleString()}</p>
                    </div>
                </div>
            )}

            <button onClick={resetForm} className="reset-btn">
                Start New Assignment
            </button>
            </div>

            {showBinScanner && (
                <BarcodeScanner 
                    onScanSuccess={handleBinScanSuccess}
                    onClose={() => setShowBinScanner(false)}
                    scannerType="Bin ID"
                />
            )}

            {showPackageScanner && (
                <BarcodeScanner 
                    onScanSuccess={handlePackageScanSuccess}
                    onClose={() => setShowPackageScanner(false)}
                    scannerType="Tracking ID"
                />
            )}
        </div>
    );
};

export default InboundProcess;
