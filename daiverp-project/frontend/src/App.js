import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import VulnerabilitiesTable from './components/VulnerabilitiesTable';
import FilterBar from './components/FilterBar';
import CSVUploader from './components/CSVUploader';

function App() {
  const [filter, setFilter] = useState({ product: '' });
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [architectureLogs, setArchitectureLogs] = useState([]);

  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;

