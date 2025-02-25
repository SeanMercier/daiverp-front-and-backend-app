// src/App.js
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import VulnerabilitiesTable from './components/VulnerabilitiesTable';
import FilterBar from './components/FilterBar';

function App() {
  const [filter, setFilter] = useState({ product: '' });

  return (
    <div className="App">
      <Dashboard />
      <FilterBar filter={filter} setFilter={setFilter} />
      <VulnerabilitiesTable filter={filter} />
    </div>
  );
}

export default App;