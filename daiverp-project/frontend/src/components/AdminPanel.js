import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import "./AdminPanel.css";
import { useNavigate } from "react-router-dom";
 
function AdminPanel() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    queueLength: 0,
    dailyPredictions: 0,
    modelDeployed: "N/A",
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [range, setRange] = useState("all");
  const navigate = useNavigate();

  // Fetch live admin metrics from backend
  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch metrics");
        return res.json();
      })
      .then((data) => setMetrics(data))
      .catch((err) => {
        console.error("Failed to fetch admin metrics:", err);
      });
  }, []);

  // Fetch chart data with dynamic range filter
  useEffect(() => {
    fetch(`/api/admin/weekly-predictions?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chart data");
        return res.json();
      })
      .then((data) => {
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: "V1 Predictions",
              data: data.v1,
              backgroundColor: "#0d6efd",
            },
            {
              label: "V2 Predictions",
              data: data.v2,
              backgroundColor: "#fd7e14",
            },
          ],
        });
      })
      .catch((err) => {
        console.error("Failed to fetch weekly predictions data:", err);
      });
  }, [range]);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <h2>👨💼 DAIVERP Admin Panel</h2>
          <p>
            Welcome, admin! This panel will display real-time system metrics,
            model info, and user activity.
          </p>
        </div>
        <img src="/DAIVERPLogo.png" alt="DAIVERP Logo" className="admin-logo" />
      </div>

      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to User Dashboard
      </button>

      <div className="metrics-grid">
        <div className="metric-box">
          👥 <strong>Active Users:</strong> {metrics.activeUsers}
        </div>
        <div className="metric-box">
          📥 <strong>Queue Length:</strong> {metrics.queueLength}
        </div>
        <div className="metric-box">
          📊 <strong>Today's Predictions:</strong> {metrics.dailyPredictions}
        </div>
        <div className="metric-box">
          🚀 <strong>Model Deployed:</strong> {metrics.modelDeployed}
        </div>
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <label htmlFor="range">📅 Filter Predictions:</label>{" "}
        <select
          id="range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginLeft: "0.5rem",
          }}
        >
          <option value="all">All Time</option>
          <option value="monthly">Last 30 Days</option>
          <option value="weekly">Last 7 Days</option>
          <option value="daily">Last 24 Hours</option>
        </select>
      </div>

      <div style={{ marginTop: "3rem", maxWidth: "800px", marginInline: "auto" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                labels: { boxWidth: 20, color: "#0d6efd" },
              },
              title: {
                display: true,
                text: "Prediction Volume by Model",
              },
            },
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } },
            },
          }}
        />
      </div>
    </div>
  );
}

export default AdminPanel;

