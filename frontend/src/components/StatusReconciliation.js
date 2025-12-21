import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StatusReconciliation.css';
import api from '../services/api';

const StatusReconciliation = () => {
    const navigate = useNavigate();
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
                // Skip header if present
                const startIndex = lines[0].toLowerCase().includes('tracking') ? 1 : 0;
                trackingIds = lines.slice(startIndex).map(line => {
                    // Handle CSV with commas - take first column
                    const columns = line.split(',');
                    return columns[0].trim();
                }).filter(id => id);
            } else if (fileType === 'json') {
                // Parse JSON
                const jsonData = JSON.parse(fileContent);
                // Support both array of strings and array of objects with tracking_id field
                if (Array.isArray(jsonData)) {
                    trackingIds = jsonData.map(item => 
                        typeof item === 'string' ? item : item.tracking_id
                    ).filter(id => id);
                } else if (jsonData.tracking_ids) {
                    trackingIds = jsonData.tracking_ids;
                }
            }

            if (trackingIds.length === 0) {
                setError('No tracking IDs found in the file');
                setLoading(false);
                return;
            }

            // Send to backend
            const response = await api.post('/inbound/process_manifest/', {
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

    return (
        <div className="reconciliation-container">
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
            <div className="reconciliation-content">
                <button className="back-button" onClick={handleBack}>
                    ← Back to Home
                </button>

                <div className="reconciliation-card">
                    <div className="card-header">
                        <h2>✅ Status Reconciliation</h2>
                        <p>Upload manifest file to update shipment status</p>
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
                                        CSV format: One tracking ID per line (with or without header)
                                    </p>
                                    <p className="info-text">
                                        JSON format: Array of tracking IDs or objects with tracking_id field
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
                                    {loading ? '⏳ Processing...' : '🚀 Upload & Process'}
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
                                        <div className="summary-icon">✔️</div>
                                        <div className="summary-text">
                                            <div className="summary-number">{results.updated_count}</div>
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

                                {results.updated_ids && results.updated_ids.length > 0 && (
                                    <div className="results-detail">
                                        <h4>✅ Successfully Updated ({results.updated_ids.length})</h4>
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
                                        <h4>❌ Failed Updates ({results.failed_ids.length})</h4>
                                        <div className="tracking-list">
                                            {results.failed_ids.map((item, index) => (
                                                <div key={index} className="tracking-item failed-item">
                                                    <strong>{item.tracking_id}</strong>: {item.reason}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button className="reset-button" onClick={handleReset}>
                                    📤 Upload Another File
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusReconciliation;
