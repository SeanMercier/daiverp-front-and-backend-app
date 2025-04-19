import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import "./AdminPanel.css";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  /* ────────── metric cards ────────── */
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    queueLength: 0,
    dailyPredictions: 0,
    modelDeployed: "N/A",
  });

  /* ────────── chart states ────────── */
  const [stackedData, setStackedData] = useState({ labels: [], datasets: [] }); // main bar + (was) small bar
  const [totalsData,  setTotalsData]  = useState({ labels: [], totals: [] });   // daily totals bar
  const [pieData,     setPieData]     = useState({ labels: [], datasets: [] }); // model‑usage pie

  const [range, setRange] = useState("all");
  const navigate = useNavigate();

  /* ────────── metric cards ────────── */
  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then(setMetrics)
      .catch((err) => console.error("Failed to fetch metrics:", err));
  }, []);

  /* ────────── fetch prediction data for bar & totals charts ────────── */
  useEffect(() => {
    fetch(`/api/admin/weekly-predictions?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        /* A) stackedData for main chart */
        setStackedData({
          labels: data.labels,
          datasets: [
            { label: "V1 Predictions", data: data.v1, backgroundColor: "#0d6efd" },
            { label: "V2 Predictions", data: data.v2, backgroundColor: "#fd7e14" },
          ],
        });

        /* B) totals for Daily Totals bar */
        const totals = data.v1.map((v, i) => v + data.v2[i]);
        setTotalsData({ labels: data.labels, totals });

        /* C) pie slices (overall counts) */
        const v1Total = data.v1.reduce((sum, n) => sum + Number(n), 0);
        const v2Total = data.v2.reduce((sum, n) => sum + Number(n), 0);
        if (v1Total + v2Total > 0) {
          setPieData({
            labels: ["V1 Predictions", "V2 Predictions"],
            datasets: [
              {
                data: [v1Total, v2Total],
                backgroundColor: ["#0d6efd", "#fd7e14"],
                hoverOffset: 6,
              },
            ],
          });
        }
      })
      .catch((err) => console.error("Failed to fetch chart data:", err));
  }, [range]);

  return (
    <div className="admin-panel">
      {/* ────────── header ────────── */}
      <div className="admin-header">
        <div className="admin-title">
          <h2>👨💼 DAIVERP Admin Panel</h2>
          <p>Real‑time system metrics &amp; model usage insights.</p>
        </div>
        <img src="/DAIVERPLogo.png" alt="DAIVERP Logo" className="admin-logo" />
      </div>

      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to User Dashboard
      </button>

      {/* ────────── metric cards ────────── */}
      <div className="metrics-grid">
        <div className="metric-box">👥 <strong>Active Users:</strong> {metrics.activeUsers}</div>
        <div className="metric-box">📥 <strong>Queue Length:</strong> {metrics.queueLength}</div>
        <div className="metric-box">📊 <strong>Today's Predictions:</strong> {metrics.dailyPredictions}</div>
        <div className="metric-box">🚀 <strong>Model Deployed:</strong> {metrics.modelDeployed}</div>
      </div>

      {/* ────────── range selector ────────── */}
      <div className="range-select">
        <label htmlFor="range">📅 Filter Predictions:</label>{" "}
        <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="all">All Time</option>
          <option value="monthly">Last 30 Days</option>
          <option value="weekly">Last 7 Days</option>
          <option value="daily">Last 24 Hours</option>
        </select>
      </div>

      {/* ────────── main side‑by‑side bar chart ────────── */}
      <div className="main-chart">
        <Bar
          data={stackedData}
          options={{
            responsive: true,
            plugins: {
              legend: { labels: { boxWidth: 20 } },
              title: { display: true, text: "Prediction Volume by Model" },
            },
            scales: { x: { stacked: false }, y: { beginAtZero: true } },
          }}
        />
      </div>

      {/* ────────── small charts row ────────── */}
      <div className="small-charts-row">
        {/* A) Model Usage pie chart */}
        <div className="small-chart-box">
          <h3 className="small-chart-title">Model Usage (all time)</h3>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const total = ctx.dataset.data.reduce((sum, n) => sum + n, 0);
                      const value = ctx.parsed;
                      const pct   = ((value / total) * 100).toFixed(1);
                      return `${ctx.label}: ${value} (${pct}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>

        {/* B) Daily Totals bar */}
        <div className="small-chart-box">
          <h3 className="small-chart-title">Daily Totals (14 d)</h3>
          <Bar
            data={{
              labels: totalsData.labels,
              datasets: [
                {
                  label: "Daily Predictions",
                  data: totalsData.totals,
                  backgroundColor: "#20c997",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { display: true }, y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

