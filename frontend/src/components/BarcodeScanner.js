import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScanSuccess, onClose, scannerType }) => {
    useEffect(() => {
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777778,
            rememberLastUsedCamera: true,
            supportedScanTypes: [
                // QR Codes
                0,
                // Barcodes
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
            ]
        };

        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            config,
            false
        );

        html5QrcodeScanner.render(
            (decodedText) => {
                onScanSuccess(decodedText);
                html5QrcodeScanner.clear();
            },
            (error) => {
                // Ignore errors while scanning
            }
        );

        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear scanner:", error);
                });
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="scanner-overlay">
            <div className="scanner-modal">
                <div className="scanner-header">
                    <h3>Scan {scannerType}</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <div id="qr-reader" className="scanner-container"></div>
                <div className="scanner-footer">
                    <p>Position the {scannerType} within the frame</p>
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
