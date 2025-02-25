// src/components/Dashboard.js
import React, { useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>CVE Dashboard</h1>
      </header>
      
      {/* Search and Filter */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">Filter by product/software...</option>
          <option value="Apache Struts">Apache Struts</option>
          <option value="Microsoft Windows">Microsoft Windows</option>
          <option value="OpenSSL">OpenSSL</option>
          <option value="WordPress">WordPress</option>
        </select>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-main">
        <div className="vulnerability-table-container">
          <table className="vuln-table">
            <thead>
              <tr>
                <th>CVE ID</th>
                <th>Product</th>
                <th>CVSS Score</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Suggested Remediation</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty Table - Data will be populated dynamically */}
            </tbody>
          </table>
        </div>
        
        {/* Sidebar Widgets */}
        <aside className="dashboard-sidebar">
          <div className="widget">
            <h3>Exploitability Likelihood</h3>
          </div>
          <div className="widget">
            <h3>CVE Count by Severity</h3>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2025 DAIVERP | Vulnerability Risk Predictor</p>
      </footer>
    </div>
  );
}

export default Dashboard;
