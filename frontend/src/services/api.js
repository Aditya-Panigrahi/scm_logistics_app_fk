import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token and warehouse_id
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add warehouse_id to query params for superadmin
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const selectedWarehouse = JSON.parse(localStorage.getItem('selected_warehouse') || 'null');
        
        if (user.role === 'SUPERADMIN' && selectedWarehouse) {
            // Add warehouse_id to query params (use warehouse_id which is the primary key)
            config.params = {
                ...config.params,
                warehouse_id: selectedWarehouse.warehouse_id
            };
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/token/refresh/`, {
                        refresh: refreshToken
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('user');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

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

export const outboundAPI = {
    // Get packages in a bin (for pickup)
    getBinPackages: (binId) => api.post('/outbound/get_bin_packages/', { bin_id: binId }),
    
    // Pickup a package (with verification)
    pickupPackage: (trackingId, expectedTrackingId) => 
        api.post('/outbound/pickup_package/', { 
            tracking_id: trackingId, 
            expected_tracking_id: expectedTrackingId 
        }),
    
    // Dispatch all picked packages from a bin (with verification)
    dispatchPackages: (binId, expectedBinId) => 
        api.post('/outbound/dispatch_packages/', { 
            bin_id: binId, 
            expected_bin_id: expectedBinId 
        }),
    
    // Get warehouse operators
    getWarehouseOperators: () => api.get('/outbound/get_warehouse_operators/'),
    
    // Assign shipments to operator
    assignToOperator: (trackingIds, operatorId) =>
        api.post('/outbound/assign_to_operator/', {
            tracking_ids: trackingIds,
            operator_id: operatorId
        }),
};

export default api;
