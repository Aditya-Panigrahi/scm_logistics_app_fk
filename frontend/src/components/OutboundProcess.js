import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OutboundProcess.css';
import BarcodeScanner from './BarcodeScanner';
import api from '../services/api';

const OutboundProcess = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('search-package'); // 'search-package', 'search-bin', 'dissociate'
    
    // Search Package State
    const [searchTrackingId, setSearchTrackingId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchScanner, setShowSearchScanner] = useState(false);
    
    // Search Bin State
    const [searchBinId, setSearchBinId] = useState('');
    const [binResult, setBinResult] = useState(null);
    const [binError, setBinError] = useState(null);
    const [binLoading, setBinLoading] = useState(false);
    const [showBinScanner, setShowBinScanner] = useState(false);
    
    // Dissociate State
    const [dissociateTrackingId, setDissociateTrackingId] = useState('');
    const [dissociateBinId, setDissociateBinId] = useState('');
    const [dissociateResult, setDissociateResult] = useState(null);
    const [dissociateError, setDissociateError] = useState(null);
    const [dissociateLoading, setDissociateLoading] = useState(false);
    const [showDissociateTrackingScanner, setShowDissociateTrackingScanner] = useState(false);
    const [showDissociateBinScanner, setShowDissociateBinScanner] = useState(false);

    const handleBack = () => {
        navigate('/');
    };

    // Search Package Functions
    const handleSearchPackage = async () => {
        if (!searchTrackingId.trim()) {
            setSearchError('Please enter a tracking ID');
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        setSearchResult(null);

        try {
            const response = await api.post('/outbound/search_package/', {
                tracking_id: searchTrackingId.trim()
            });

            if (response.data.success) {
                setSearchResult(response.data.package);
            }
            setSearchLoading(false);
        } catch (error) {
            console.error('Search error:', error);
            setSearchError(error.response?.data?.errors?.tracking_id?.[0] || 'Failed to search package');
            setSearchLoading(false);
        }
    };

    const handleSearchScan = (scannedValue) => {
        setSearchTrackingId(scannedValue);
        setShowSearchScanner(false);
    };

    const handleResetSearch = () => {
        setSearchTrackingId('');
        setSearchResult(null);
        setSearchError(null);
    };

    // Search Bin Functions
    const handleSearchBin = async () => {
        if (!searchBinId.trim()) {
            setBinError('Please enter a bin ID');
            return;
        }

        setBinLoading(true);
        setBinError(null);
        setBinResult(null);

        try {
            const response = await api.post('/outbound/search_bin/', {
                bin_id: searchBinId.trim()
            });

            if (response.data.success) {
                setBinResult(response.data);
            }
            setBinLoading(false);
        } catch (error) {
            console.error('Bin search error:', error);
            setBinError(error.response?.data?.errors?.bin_id?.[0] || 'Failed to search bin');
            setBinLoading(false);
        }
    };

    const handleBinScan = (scannedValue) => {
        setSearchBinId(scannedValue);
        setShowBinScanner(false);
    };

    const handleResetBinSearch = () => {
        setSearchBinId('');
        setBinResult(null);
        setBinError(null);
    };

    // Dissociate Functions
    const handleDissociate = async () => {
        if (!dissociateTrackingId.trim() || !dissociateBinId.trim()) {
            setDissociateError('Please enter both tracking ID and bin ID');
            return;
        }

        setDissociateLoading(true);
        setDissociateError(null);
        setDissociateResult(null);

        try {
            const response = await api.post('/outbound/dissociate/', {
                tracking_id: dissociateTrackingId.trim(),
                bin_id: dissociateBinId.trim()
            });

            if (response.data.success) {
                setDissociateResult(response.data);
            }
            setDissociateLoading(false);
        } catch (error) {
            console.error('Dissociate error:', error);
            const errorMsg = error.response?.data?.errors?.non_field_errors?.[0] || 
                           error.response?.data?.errors || 
                           'Failed to dissociate package';
            setDissociateError(errorMsg);
            setDissociateLoading(false);
        }
    };

    const handleDissociateTrackingScan = (scannedValue) => {
        setDissociateTrackingId(scannedValue);
        setShowDissociateTrackingScanner(false);
    };

    const handleDissociateBinScan = (scannedValue) => {
        setDissociateBinId(scannedValue);
        setShowDissociateBinScanner(false);
    };

    const handleResetDissociate = () => {
        setDissociateTrackingId('');
        setDissociateBinId('');
        setDissociateResult(null);
        setDissociateError(null);
    };

    return (
        <div className="outbound-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="logo">
                            Flipkart
                            <span className="logo-tagline">SCM</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="outbound-content">
                <button className="back-button" onClick={handleBack}>
                    ← Back to Home
                </button>

                <div className="outbound-card">
                    <div className="card-header">
                        <h2>🚚 Outbound Process</h2>
                        <p>Locate and pick up packages for dispatch</p>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button 
                            className={`tab-button ${activeTab === 'search-package' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search-package')}
                        >
                            📦 Search Package
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'search-bin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search-bin')}
                        >
                            📊 Bin Audit
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'dissociate' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dissociate')}
                        >
                            ✅ Pick Up Package
                        </button>
                    </div>

                    <div className="card-body">
                        {/* Search Package Tab */}
                        {activeTab === 'search-package' && (
                            <div className="tab-content">
                                <h3>Find Package Location</h3>
                                <p className="instruction">Enter or scan tracking ID to find bin location</p>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter Tracking ID"
                                        value={searchTrackingId}
                                        onChange={(e) => setSearchTrackingId(e.target.value)}
                                        disabled={searchLoading}
                                    />
                                    <button 
                                        className="scan-button"
                                        onClick={() => setShowSearchScanner(true)}
                                        disabled={searchLoading}
                                    >
                                        📷 Scan
                                    </button>
                                </div>

                                <button 
                                    className="action-button"
                                    onClick={handleSearchPackage}
                                    disabled={searchLoading}
                                >
                                    {searchLoading ? '⏳ Searching...' : '🔍 Search Package'}
                                </button>

                                {searchError && (
                                    <div className="error-box">
                                        ⚠️ {searchError}
                                    </div>
                                )}

                                {searchResult && (
                                    <div className="result-box">
                                        <h4>✅ Package Found</h4>
                                        <div className="result-details">
                                            <div className="detail-row">
                                                <span className="label">Tracking ID:</span>
                                                <span className="value">{searchResult.tracking_id}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Status:</span>
                                                <span className={`status-badge ${searchResult.status}`}>
                                                    {searchResult.status}
                                                </span>
                                            </div>
                                            {searchResult.bin ? (
                                                <>
                                                    <div className="detail-row highlight">
                                                        <span className="label">📍 Bin Location:</span>
                                                        <span className="value bin-highlight">{searchResult.bin.bin_id}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <span className="label">Bin Address:</span>
                                                        <span className="value">{searchResult.bin.location}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="detail-row">
                                                    <span className="label">Bin:</span>
                                                    <span className="value">Not assigned</span>
                                                </div>
                                            )}
                                        </div>
                                        <button className="reset-button" onClick={handleResetSearch}>
                                            🔄 Search Another
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Search Bin Tab */}
                        {activeTab === 'search-bin' && (
                            <div className="tab-content">
                                <h3>Bin Audit</h3>
                                <p className="instruction">Enter or scan bin ID to view all packages</p>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter Bin ID"
                                        value={searchBinId}
                                        onChange={(e) => setSearchBinId(e.target.value)}
                                        disabled={binLoading}
                                    />
                                    <button 
                                        className="scan-button"
                                        onClick={() => setShowBinScanner(true)}
                                        disabled={binLoading}
                                    >
                                        📷 Scan
                                    </button>
                                </div>

                                <button 
                                    className="action-button"
                                    onClick={handleSearchBin}
                                    disabled={binLoading}
                                >
                                    {binLoading ? '⏳ Searching...' : '🔍 Search Bin'}
                                </button>

                                {binError && (
                                    <div className="error-box">
                                        ⚠️ {binError}
                                    </div>
                                )}

                                {binResult && (
                                    <div className="result-box">
                                        <h4>📦 Bin Contents</h4>
                                        <div className="result-details">
                                            <div className="detail-row highlight">
                                                <span className="label">Bin ID:</span>
                                                <span className="value bin-highlight">{binResult.bin.bin_id}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Location:</span>
                                                <span className="value">{binResult.bin.location}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Status:</span>
                                                <span className={`status-badge ${binResult.bin.status}`}>
                                                    {binResult.bin.status}
                                                </span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Package Count:</span>
                                                <span className="value">{binResult.package_count}</span>
                                            </div>
                                        </div>

                                        {binResult.packages && binResult.packages.length > 0 ? (
                                            <div className="packages-list">
                                                <h5>Packages in this Bin:</h5>
                                                {binResult.packages.map((pkg, index) => (
                                                    <div key={index} className="package-item">
                                                        <div className="package-info">
                                                            <span className="tracking-id">{pkg.tracking_id}</span>
                                                            <span className={`status-badge ${pkg.status}`}>
                                                                {pkg.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-message">
                                                📭 No packages in this bin
                                            </div>
                                        )}

                                        <button className="reset-button" onClick={handleResetBinSearch}>
                                            🔄 Search Another Bin
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Dissociate Tab */}
                        {activeTab === 'dissociate' && (
                            <div className="tab-content">
                                <h3>Pick Up Package</h3>
                                <p className="instruction">Remove package from bin for dispatch</p>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter Tracking ID"
                                        value={dissociateTrackingId}
                                        onChange={(e) => setDissociateTrackingId(e.target.value)}
                                        disabled={dissociateLoading}
                                    />
                                    <button 
                                        className="scan-button"
                                        onClick={() => setShowDissociateTrackingScanner(true)}
                                        disabled={dissociateLoading}
                                    >
                                        📷 Scan
                                    </button>
                                </div>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter Bin ID"
                                        value={dissociateBinId}
                                        onChange={(e) => setDissociateBinId(e.target.value)}
                                        disabled={dissociateLoading}
                                    />
                                    <button 
                                        className="scan-button"
                                        onClick={() => setShowDissociateBinScanner(true)}
                                        disabled={dissociateLoading}
                                    >
                                        📷 Scan
                                    </button>
                                </div>

                                <button 
                                    className="action-button pickup"
                                    onClick={handleDissociate}
                                    disabled={dissociateLoading}
                                >
                                    {dissociateLoading ? '⏳ Processing...' : '📤 Pick Up Package'}
                                </button>

                                {dissociateError && (
                                    <div className="error-box">
                                        ⚠️ {dissociateError}
                                    </div>
                                )}

                                {dissociateResult && (
                                    <div className="result-box success">
                                        <h4>✅ Package Picked Up Successfully</h4>
                                        <div className="success-message">
                                            {dissociateResult.message}
                                        </div>
                                        <div className="result-details">
                                            <div className="detail-row">
                                                <span className="label">Tracking ID:</span>
                                                <span className="value">{dissociateResult.package.tracking_id}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">New Status:</span>
                                                <span className={`status-badge ${dissociateResult.package.status}`}>
                                                    {dissociateResult.package.status}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="reset-button" onClick={handleResetDissociate}>
                                            🔄 Pick Up Another
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Barcode Scanners */}
            {showSearchScanner && (
                <BarcodeScanner
                    onScan={handleSearchScan}
                    onClose={() => setShowSearchScanner(false)}
                />
            )}
            {showBinScanner && (
                <BarcodeScanner
                    onScan={handleBinScan}
                    onClose={() => setShowBinScanner(false)}
                />
            )}
            {showDissociateTrackingScanner && (
                <BarcodeScanner
                    onScan={handleDissociateTrackingScan}
                    onClose={() => setShowDissociateTrackingScanner(false)}
                />
            )}
            {showDissociateBinScanner && (
                <BarcodeScanner
                    onScan={handleDissociateBinScan}
                    onClose={() => setShowDissociateBinScanner(false)}
                />
            )}
        </div>
    );
};

export default OutboundProcess;
