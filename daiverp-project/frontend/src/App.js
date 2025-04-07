import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import VulnerabilitiesTable from './components/VulnerabilitiesTable';
import FilterBar from './components/FilterBar';
import CSVUploader from './components/CSVUploader';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/ping").catch((err) => console.warn("Ping failed:", err));
    }, 15000); // Every 60s

    return () => clearInterval(interval);
  }, []);

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

