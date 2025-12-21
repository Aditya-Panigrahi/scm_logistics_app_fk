import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import InboundProcess from './components/InboundProcess';
import OutboundProcess from './components/OutboundProcess';
import StatusReconciliation from './components/StatusReconciliation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inbound" element={<InboundProcess />} />
          <Route path="/outbound" element={<OutboundProcess />} />
          <Route path="/status-reconciliation" element={<StatusReconciliation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
