import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import InboundProcess from './components/InboundProcess';
import OutboundProcess from './components/OutboundProcess';
import ManifestCreation from './components/ManifestCreation';
import InventoryDashboard from './components/InventoryDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inbound" element={<InboundProcess />} />
          <Route path="/outbound" element={<OutboundProcess />} />
          <Route path="/manifest-creation" element={<ManifestCreation />} />
          <Route path="/inventory-dashboard" element={<InventoryDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
