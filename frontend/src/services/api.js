import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const inboundAPI = {
    // Scan bin
    scanBin: (binId) => api.post('/inbound/scan_bin/', { bin_id: binId }),
    
    // Scan package
    scanPackage: (trackingId) => api.post('/inbound/scan_package/', { tracking_id: trackingId }),
    
    // Assign package to bin
    assignPackage: (binId, trackingId) => 
        api.post('/inbound/assign/', { bin_id: binId, tracking_id: trackingId }),
    
    // Get all shipments
    getShipments: () => api.get('/shipments/'),
    
    // Get all bins
    getBins: () => api.get('/bins/'),
    
    // Get audit logs
    getAuditLogs: () => api.get('/audit-logs/'),
};

export default api;
