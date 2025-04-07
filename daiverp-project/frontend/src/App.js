import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import VulnerabilitiesTable from './components/VulnerabilitiesTable';
import FilterBar from './components/FilterBar';
import CSVUploader from './components/CSVUploader';

function App() {
  const [filter, setFilter] = useState({ product: '' });
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [architectureLogs, setArchitectureLogs] = useState([]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

export default App;

