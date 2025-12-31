import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ManifestCreation.css';
import api from '../services/api';

const ManifestCreation = () => {
    const navigate = useNavigate();
    const { selectedWarehouse } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState('csv');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (extension === 'csv' || extension === 'json') {
                setSelectedFile(file);
                setFileType(extension);
                setError(null);
            } else {
                setError('Please select a CSV or JSON file');
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const fileContent = await selectedFile.text();
            let trackingIds = [];

            if (fileType === 'csv') {
                // Parse CSV
                const lines = fileContent.split('\n').filter(line => line.trim());
                
                if (lines.length === 0) {
                    setError('File is empty');
                    setLoading(false);
                    return;
                }

                // Find the header row
                const headerLine = lines[0];
                const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
                
                // Find the "Tracking Id" column index
                const trackingIdIndex = headers.findIndex(h => 
                    h === 'tracking id' || h === 'tracking_id' || h === 'trackingid'
                );

                if (trackingIdIndex === -1) {
                    // If no header found, assume first column is tracking ID
                    trackingIds = lines.map(line => {
                        const columns = line.split(',');
                        return columns[0].trim();
                    }).filter(id => id && id.toLowerCase() !== 'tracking id' && id.toLowerCase() !== 'tracking_id');
                } else {
                    // Extract tracking IDs from the identified column
                    trackingIds = lines.slice(1).map(line => {
                        const columns = line.split(',');
                        return columns[trackingIdIndex] ? columns[trackingIdIndex].trim() : '';
                    }).filter(id => id);
                }
            } else if (fileType === 'json') {
                // Parse JSON
                const jsonData = JSON.parse(fileContent);
                // Support both array of strings and array of objects with tracking_id field
                if (Array.isArray(jsonData)) {
                    trackingIds = jsonData.map(item => {
                        if (typeof item === 'string') {
                            return item;
                        } else if (item.tracking_id || item['Tracking Id']) {
                            return item.tracking_id || item['Tracking Id'];
                        }
                        return null;
                    }).filter(id => id);
                } else if (jsonData.tracking_ids) {
                    trackingIds = jsonData.tracking_ids;
                }
            }

            if (trackingIds.length === 0) {
                setError('No tracking IDs found in the file. Please ensure the file has a "Tracking Id" column.');
                setLoading(false);
                return;
            }

            // Check if warehouse is selected (for superadmin)
            if (!selectedWarehouse) {
                setError('Please select a warehouse before uploading manifest.');
                setLoading(false);
                return;
            }

            // Send to backend with warehouse_id as query param
            const url = `/inbound/process_manifest/?warehouse_id=${selectedWarehouse.warehouse_id}`;
            const response = await api.post(url, {
                tracking_ids: trackingIds
            });

            setResults(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.errors || err.message || 'Failed to process manifest file');
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setResults(null);
        setError(null);
        document.getElementById('fileInput').value = '';
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleDownloadLogs = () => {
        if (!results) return;

        // Prepare log data
        const logLines = [];
        logLines.push('Tracking ID,Status,Details');
        logLines.push(''); // Empty line for separation
        logLines.push(`Upload Summary - ${new Date().toLocaleString()}`);
        logLines.push(`Total Processed: ${results.total_processed}`);
        logLines.push(`Created: ${results.created_count || 0}`);
        logLines.push(`Updated: ${results.updated_count || 0}`);
        logLines.push(`Failed: ${results.failed_count}`);
        logLines.push(''); // Empty line for separation
        logLines.push('Tracking ID,Status,Details');

        // Add created records
        if (results.created_ids && results.created_ids.length > 0) {
            results.created_ids.forEach(id => {
                logLines.push(`${id},Created,Successfully created new shipment record`);
            });
        }

        // Add updated records
        if (results.updated_ids && results.updated_ids.length > 0) {
            results.updated_ids.forEach(id => {
                logLines.push(`${id},Updated,Successfully updated existing shipment record`);
            });
        }

        // Add failed records
        if (results.failed_ids && results.failed_ids.length > 0) {
            results.failed_ids.forEach(item => {
                const reason = item.reason ? item.reason.replace(/,/g, ';') : 'Unknown error';
                logLines.push(`${item.tracking_id},Failed,"${reason}"`);
            });
        }

        // Create CSV content
        const csvContent = logLines.join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `manifest_upload_log_${timestamp}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="manifest-container">
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
            <div className="manifest-content">
                <div className="manifest-card">
                    <div className="card-header">
                        <h2>📋 Manifest Creation</h2>
                        <p>Upload manifest file to create shipment records</p>
                    </div>

                    <div className="card-body">
                        {/* File Upload Section */}
                        {!results && (
                            <div className="upload-section">
                                <div className="file-info">
                                    <p className="info-text">
                                        📄 Supported formats: CSV, JSON
                                    </p>
                                    <p className="info-text">
                                        CSV format: Must have a "Tracking Id" column header
                                    </p>
                                    <p className="info-text">
                                        JSON format: Array of objects with "tracking_id" or "Tracking Id" field
                                    </p>
                                </div>

                                <div className="file-input-wrapper">
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept=".csv,.json"
                                        onChange={handleFileSelect}
                                        className="file-input"
                                    />
                                    <label htmlFor="fileInput" className="file-input-label">
                                        {selectedFile ? '📎 ' + selectedFile.name : '📁 Choose File'}
                                    </label>
                                </div>

                                {selectedFile && (
                                    <div className="file-selected">
                                        <p>Selected: <strong>{selectedFile.name}</strong></p>
                                        <p>Type: <strong>{fileType.toUpperCase()}</strong></p>
                                        <p>Size: <strong>{(selectedFile.size / 1024).toFixed(2)} KB</strong></p>
                                    </div>
                                )}

                                <button
                                    className="upload-button"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || loading}
                                >
                                    {loading ? '⏳ Processing...' : '🚀 Upload & Create Manifest'}
                                </button>

                                {error && (
                                    <div className="error-message">
                                        ⚠️ {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Results Section */}
                        {results && (
                            <div className="results-section">
                                <div className="results-header">
                                    <h3>✅ Processing Complete</h3>
                                </div>

                                <div className="results-summary">
                                    <div className="summary-card success">
                                        <div className="summary-icon">✨</div>
                                        <div className="summary-text">
                                            <div className="summary-number">{results.created_count || 0}</div>
                                            <div className="summary-label">Created</div>
                                        </div>
                                    </div>

                                    <div className="summary-card updated">
                                        <div className="summary-icon">✔️</div>
                                        <div className="summary-text">
                                            <div className="summary-number">{results.updated_count || 0}</div>
                                            <div className="summary-label">Updated</div>
                                        </div>
                                    </div>

                                    <div className="summary-card failed">
                                        <div className="summary-icon">❌</div>
                                        <div className="summary-text">
                                            <div className="summary-number">{results.failed_count}</div>
                                            <div className="summary-label">Failed</div>
                                        </div>
                                    </div>

                                    <div className="summary-card total">
                                        <div className="summary-icon">📊</div>
                                        <div className="summary-text">
                                            <div className="summary-number">{results.total_processed}</div>
                                            <div className="summary-label">Total</div>
                                        </div>
                                    </div>
                                </div>

                                {results.created_ids && results.created_ids.length > 0 && (
                                    <div className="results-detail">
                                        <h4>✨ Successfully Created ({results.created_ids.length})</h4>
                                        <div className="tracking-list">
                                            {results.created_ids.map((id, index) => (
                                                <div key={index} className="tracking-item success-item">
                                                    {id}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.updated_ids && results.updated_ids.length > 0 && (
                                    <div className="results-detail">
                                        <h4>✔️ Successfully Updated ({results.updated_ids.length})</h4>
                                        <div className="tracking-list">
                                            {results.updated_ids.map((id, index) => (
                                                <div key={index} className="tracking-item success-item">
                                                    {id}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.failed_ids && results.failed_ids.length > 0 && (
                                    <div className="results-detail">
                                        <h4>❌ Failed ({results.failed_ids.length})</h4>
                                        <div className="tracking-list">
                                            {results.failed_ids.map((item, index) => (
                                                <div key={index} className="tracking-item failed-item">
                                                    <strong>{item.tracking_id}</strong>: {item.reason}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="action-buttons">
                                    <button className="download-logs-button" onClick={handleDownloadLogs}>
                                        📥 Download Logs
                                    </button>
                                    <button className="reset-button" onClick={handleReset}>
                                        📤 Upload Another File
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManifestCreation;
