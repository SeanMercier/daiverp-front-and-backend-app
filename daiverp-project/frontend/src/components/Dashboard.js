import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CSVUploader from "./CSVUploader"; // Custom uploader component
import { Bar } from "react-chartjs-2"; // Charting library for rendering severity breakdown
import { Chart as ChartJS } from "chart.js/auto"; // Registers all required chart.js components globally
import "./Dashboard.css"; // Local styling

function Dashboard() {
  // === State Hooks ===
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [products, setProducts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showSeverityChart, setShowSeverityChart] = useState(false);

  // Admin related states
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const ADMIN_USER = process.env.REACT_APP_ADMIN_USERNAME;
  const ADMIN_PASS = process.env.REACT_APP_ADMIN_PASSWORD;

  const handleAdminLogin = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      navigate("/admin");
    } else {
      alert("Invalid credentials");
    }
  };

  // === Fetch product list from backend on first load ===
  // Ref: https://reactjs.org/docs/hooks-effect.html
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // === Handle successful CSV upload response ===
  const handleUploadSuccess = (response) => {
    if (response.download_url) {
      const httpsBackend = `https://${window.location.hostname}:8080`;
      setDownloadUrl(`${httpsBackend}${response.download_url}`);
      setUploadStatus("✅ File processed successfully! Download predictions above.");
      setPredictions(response.predictions || []);
    } else {
      setUploadStatus("❌ Upload failed. Please check the file and try again.");
    }
  };

  // === Client-side download handler ===
  // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Blob
  const handleDownload = async () => {
    try {
      const response = await fetch(downloadUrl, { method: "GET" });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "predictions.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // === Convert DAIVERP score (e.g., 82.45%) to qualitative label ===
  const getSeverityLabel = (scoreString) => {
    const numericScore = parseFloat(scoreString.replace("%", "")) || 0;
    if (numericScore >= 80) return "Critical";
    if (numericScore >= 60) return "High";
    if (numericScore >= 40) return "Medium";
    if (numericScore >= 20) return "Low";
    return "Very Low";
  };

  // === Assign numerical weight for sorting by severity ===
  const getSeverityRank = (scoreString) => {
    const numericScore = parseFloat(scoreString.replace("%", "")) || 0;
    if (numericScore >= 80) return 5;
    if (numericScore >= 60) return 4;
    if (numericScore >= 40) return 3;
    if (numericScore >= 20) return 2;
    return 1;
  };

  // === Efficient filtering by product and search query ===
  // Ref: https://reactjs.org/docs/hooks-reference.html#usememo
  const filteredPredictions = useMemo(() => {
    return predictions.filter((row) => {
      const productMatch = selectedProduct ? row.Product === selectedProduct : true;
      const searchMatch =
        row.CVE_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.System_ID.toLowerCase().includes(searchQuery.toLowerCase());
      return productMatch && searchMatch;
    });
  }, [predictions, selectedProduct, searchQuery]);

  // === Column-based sorting (client-side) ===
  const requestSort = (columnKey) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // === Apply sortConfig to filtered data ===
  const sortedPredictions = useMemo(() => {
    if (!sortConfig.key) return filteredPredictions;
    const sorted = [...filteredPredictions];

    sorted.sort((a, b) => {
      if (sortConfig.key === "DAIVERP_Risk_Score") {
        const aNum = parseFloat(String(a.DAIVERP_Risk_Score).replace("%", "")) || 0;
        const bNum = parseFloat(String(b.DAIVERP_Risk_Score).replace("%", "")) || 0;
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      if (sortConfig.key === "Severity") {
        const aRank = getSeverityRank(a.DAIVERP_Risk_Score);
        const bRank = getSeverityRank(b.DAIVERP_Risk_Score);
        return sortConfig.direction === "asc" ? aRank - bRank : bRank - aRank;
      }

      const aVal = String(a[sortConfig.key]).toLowerCase();
      const bVal = String(b[sortConfig.key]).toLowerCase();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredPredictions, sortConfig]);

  const renderSortIcon = (colKey) => {
    if (sortConfig.key !== colKey) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // === Toggle chart visibility ===
  const handleShowChart = () => setShowSeverityChart(!showSeverityChart);

  // === Inline component: Bar chart grouped by severity levels ===
  function SeverityBarChart({ predictions }) {
    const severityCounts = useMemo(() => {
      const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, "Very Low": 0 };
      predictions.forEach((row) => {
        const sev = getSeverityLabel(row.DAIVERP_Risk_Score);
        if (counts[sev] !== undefined) {
          counts[sev]++;
        }
      });
      return counts;
    }, [predictions]);

    const data = useMemo(() => ({
      labels: Object.keys(severityCounts),
      datasets: [
        {
          label: "CVE Count by Severity",
          data: Object.values(severityCounts),
          backgroundColor: [
            "#f50707", // Critical
	    "#fc9014", // High
	    "#f2e307", // Medium
	    "#08a7fc", // Low
	    "#07f223"  // Very Low
          ],
        },
      ],
    }), [severityCounts]);

    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "CVE Count by Severity" },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    };

    return (
      <div style={{ maxWidth: "600px", margin: "20px auto" }}>
        <Bar data={data} options={options} />
      </div>
    );
  }

  // === History feature state and fetch ===
  const [historyRecords, setHistoryRecords] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleShowHistory = async () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      try {
        const res = await fetch("/api/history");
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistoryRecords(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    }
  };

  const handleDownloadOldFile = async (filename) => {
    const httpsBackend = `https://${window.location.hostname}:8080`;
    const downloadLink = `${httpsBackend}/download/${filename}`;
    try {
      const response = await fetch(downloadLink);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download old file failed:", err);
    }
  };

  // === JSX Markup ===
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>DAIVERP Dashboard</h1>
        <img src="/DAIVERPLogo.png" alt="DAIVERP Logo" className="logo" />
        <button className="admin-login-button" onClick={() => setShowLogin(true)}>🔐 Admin Login</button>
      </header>

      {showLogin && (
        <div className="modal">
          <div className="modal-content">
            <h3>Admin Login</h3>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleAdminLogin}>Login</button>
            <button onClick={() => setShowLogin(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="upload-section">
        <CSVUploader onUploadSuccess={handleUploadSuccess} />
      </div>

      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}

      <div className="filter-container">
        <input type="text" placeholder="🔍 Search by CVE ID or System ID..." className="search-bar" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <select className="filter-dropdown" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
          <option value="">📌 Filter by product/software...</option>
          {[...new Set(predictions.map((p) => p.Product))].map((product, index) => (
            <option key={index} value={product}>{product}</option>
          ))}
        </select>
      </div>

      <div className="table-scroll-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th onClick={() => requestSort("CVE_ID")}>CVE ID{renderSortIcon("CVE_ID")}</th>
              <th onClick={() => requestSort("System_ID")}>System ID{renderSortIcon("System_ID")}</th>
              <th onClick={() => requestSort("Product")}>Product Name{renderSortIcon("Product")}</th>
              <th onClick={() => requestSort("DAIVERP_Risk_Score")}>DAIVERP Score{renderSortIcon("DAIVERP_Risk_Score")}</th>
              <th onClick={() => requestSort("Severity")}>Severity{renderSortIcon("Severity")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedPredictions.length > 0 ? (
              sortedPredictions.map((row, index) => {
                const severityLabel = getSeverityLabel(row.DAIVERP_Risk_Score);
                return (
                  <tr key={index}>
                    <td>{row.CVE_ID}</td>
                    <td>{row.System_ID}</td>
                    <td>{row.Product}</td>
                    <td>{row.DAIVERP_Risk_Score}</td>
                    <td>{severityLabel}</td>
                  </tr>
                );
              })
            ) : (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td colSpan="5">No predictions to display yet.</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sidebar">
        <button className="sidebar-button">📊 Exploitability Likelihood</button>
        <button className="sidebar-button" onClick={handleShowChart}>📈 CVE Count by Severity</button>
        <button className="sidebar-button" onClick={handleShowHistory}>🕑 History</button>
      </div>

      {downloadUrl && (
        <div className="download-container">
          <button onClick={handleDownload} className="download-button">⬇️ Download Predictions CSV</button>
        </div>
      )}

      {showSeverityChart && <SeverityBarChart predictions={predictions} />}

      {showHistory && (
        <div className="history-panel" style={{ margin: "20px" }}>
          <h2>Prediction History</h2>
          {historyRecords.length === 0 ? (
            <p>No history yet.</p>
          ) : (
            <ul>
              {historyRecords.map((record, i) => (
                <li key={i} style={{ marginBottom: "10px" }}>
                  <p><strong>Timestamp:</strong> {record.timestamp} <strong>Model:</strong> {record.model}</p>
                  <button className="download-button" onClick={() => handleDownloadOldFile(record.filename)}>
                    Download {record.filename}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <footer>
        <p>© 2025 DAIVERP | Vulnerability Risk Predictor</p>
      </footer>
    </div>
  );
}

export default Dashboard;

