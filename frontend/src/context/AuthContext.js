import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    const storedWarehouse = localStorage.getItem('selected_warehouse');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      if (storedWarehouse) {
        setSelectedWarehouse(JSON.parse(storedWarehouse));
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokens) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setUser(userData);
    
    // For superadmin, if they have accessible warehouses, don't set a default
    // For other users, set their assigned warehouse
    if (userData.role !== 'SUPERADMIN' && userData.warehouse_details) {
      const warehouseData = userData.warehouse_details;
      setSelectedWarehouse(warehouseData);
      localStorage.setItem('selected_warehouse', JSON.stringify(warehouseData));
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('selected_warehouse');
    setUser(null);
    setSelectedWarehouse(null);
    navigate('/login');
  };

  const selectWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse);
    localStorage.setItem('selected_warehouse', JSON.stringify(warehouse));
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    const role = user.role;
    const permissions = {
      SUPERADMIN: ['inbound', 'outbound', 'manifest', 'inventory', 'users', 'warehouses'],
      WAREHOUSE_ADMIN: ['inbound', 'outbound', 'manifest', 'inventory', 'users'],
      OPERATION_HEAD: ['inbound', 'outbound', 'manifest', 'inventory'],
      OPERATOR: ['inbound', 'outbound-pickup']
    };
    
    return permissions[role]?.includes(permission) || false;
  };

  const canWrite = () => {
    if (!user) return false;
    // Operation Head has read-only access
    return user.role !== 'OPERATION_HEAD';
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    canWrite,
    selectedWarehouse,
    selectWarehouse
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
