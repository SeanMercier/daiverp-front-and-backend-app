import React, { useEffect, useState } from 'react';

function VulnerabilitiesTable({ filter, vulnerabilities }) {
  // === Internal state to hold all vulnerability records ===
  const [allVulns, setAllVulns] = useState([]);

  // === useEffect handles loading logic ===
  // If props.vulnerabilities is empty, it falls back to fetch live data from API.
  // Otherwise, use passed-in vulnerabilities.
  // Ref: https://reactjs.org/docs/hooks-effect.html
  useEffect(() => {
    if (vulnerabilities.length > 0) {
      setAllVulns(vulnerabilities);
    } else {
      fetch('http://176.34.138.89:8080/api/vulnerabilities')
        .then(response => response.json())
        .then(data => setAllVulns(data))
        .catch(err => console.error(err)); // Handle fetch errors gracefully
    }
  }, [vulnerabilities]);

  // === Filter logic ===
  // If filter.product is set, return only those vulnerabilities with matching product names
  // Uses `toLowerCase()` for case-insensitive partial match
  const filteredVulns = allVulns.filter(v =>
    filter.product === '' || v.product.toLowerCase().includes(filter.product.toLowerCase())
  );

  // === Render HTML table of vulnerabilities ===
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
          {filteredVulns.map((v, index) => (
            <tr key={index}>
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

