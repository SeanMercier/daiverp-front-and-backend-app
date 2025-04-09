import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
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

// Fetch weekly prediction data from backend
useEffect(() => {
  fetch("/api/admin/weekly-predictions")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch weekly chart data");
      return res.json();
    })
    .then((data) => {
      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "V1 Predictions",
            data: data.v1,
            backgroundColor: "#0d6efd", // blue
          },
          {
            label: "V2 Predictions",
            data: data.v2,
            backgroundColor: "#fd7e14", // orange
          },
        ],
      });
    })
    .catch((err) => {
      console.error("Failed to fetch weekly predictions data:", err);
    });
}, []);


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
                text: "Prediction Volume This Week",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 10 },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default AdminPanel;

