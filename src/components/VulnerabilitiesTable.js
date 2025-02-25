import React, { useEffect, useState } from 'react';

function VulnerabilitiesTable({ filter }) {
  const [allVulns, setAllVulns] = useState([]);
  const [filteredVulns, setFilteredVulns] = useState([]);

  useEffect(() => {
    fetch('/api/vulnerabilities')
      .then(response => response.json())
      .then(data => {
        setAllVulns(data);
        setFilteredVulns(data); // start with the full set
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // when filter changes, recalculate the displayed vulnerabilities
    const newVulns = allVulns.filter(v => 
      filter.product === '' || v.product.toLowerCase().includes(filter.product.toLowerCase())
    );
    setFilteredVulns(newVulns);
  }, [filter, allVulns]);

  return (
    <div>
      <h2>Vulnerability List</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>DAIVERP Score</th>
            <th>CVSS Score</th>
            <th>Product</th>
          </tr>
        </thead>
        <tbody>
          {filteredVulns.map(v => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.daiverp_score}</td>
              <td>{v.cvss_score}</td>
              <td>{v.product}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VulnerabilitiesTable;
