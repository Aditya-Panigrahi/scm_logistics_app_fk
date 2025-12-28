import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import InboundProcess from './components/InboundProcess';
import OutboundProcess from './components/OutboundProcess';
import ManifestCreation from './components/ManifestCreation';
import InventoryDashboard from './components/InventoryDashboard';
import UserManagement from './components/UserManagement';
import WarehouseManagement from './components/WarehouseManagement';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            
            <Route path="/inbound" element={
              <PrivateRoute permission="inbound">
                <InboundProcess />
              </PrivateRoute>
            } />
            
            <Route path="/outbound" element={
              <PrivateRoute allowedPermissions={['outbound', 'outbound-pickup']}>
                <OutboundProcess />
              </PrivateRoute>
            } />
            
            <Route path="/manifest-creation" element={
              <PrivateRoute permission="manifest">
                <ManifestCreation />
              </PrivateRoute>
            } />
            
            <Route path="/inventory-dashboard" element={
              <PrivateRoute permission="inventory">
                <InventoryDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/user-management" element={
              <PrivateRoute permission="users">
                <UserManagement />
              </PrivateRoute>
            } />
            
            <Route path="/warehouse-management" element={
              <PrivateRoute permission="warehouses">
                <WarehouseManagement />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
