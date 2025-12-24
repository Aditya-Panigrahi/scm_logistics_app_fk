import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScanSuccess, onClose, scannerType }) => {
    const scannerRef = useRef(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        // Prevent duplicate initialization
        if (isInitialized.current) {
            return;
        }
        isInitialized.current = true;

        // Clear any existing content in the scanner element
        const scannerElement = document.getElementById('qr-reader');
        if (scannerElement) {
            scannerElement.innerHTML = '';
        }

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777778,
            rememberLastUsedCamera: true,
            supportedScanTypes: [
                0,  // QR Codes
                1   // Standard barcode
            ]
        };

        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            config,
            false
        );

        scannerRef.current = html5QrcodeScanner;

        html5QrcodeScanner.render(
            (decodedText) => {
                onScanSuccess(decodedText);
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear scanner:", error);
                });
            },
            (error) => {
                // Ignore errors while scanning
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner:", error);
                });
                scannerRef.current = null;
            }
            // Clear the DOM element on cleanup
            if (scannerElement) {
                scannerElement.innerHTML = '';
            }
            isInitialized.current = false;
        };
    }, []);

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
