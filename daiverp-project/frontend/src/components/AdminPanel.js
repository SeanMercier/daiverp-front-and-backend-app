import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import "./AdminPanel.css";
import { useNavigate } from "react-router-dom";

const hourLabels24 = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
const DEMO_KEY = "daiverpDemoSeed";

function seededRandom(seed) {
  return function () {
    seed = Math.sin(seed) * 10000;
    return seed - Math.floor(seed);
  };
}

function loadDemoSeed() {
  const cached = localStorage.getItem(DEMO_KEY);
  if (cached) return JSON.parse(cached);

  const rng = seededRandom(1234); // hardcoded seed
  const demo = {
    v1: hourLabels24.map(() => Math.floor(rng() * 10) + 3),
    v2: hourLabels24.map(() => Math.floor(rng() * 8) + 2),
  };
  localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
  return demo;
}

const { v1: demoHourV1, v2: demoHourV2 } = loadDemoSeed();
const sumArr = (arr) => arr.reduce((s, n) => s + n, 0);
const normHour = (lab) => (/^\d{2}:\d{2}$/.test(lab) ? lab : `${lab.toString().padStart(2, "0")}:00`);

function AdminPanel() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({ activeUsers: 0, queueLength: 0, dailyPredictions: 0, modelDeployed: "N/A" });
  const [stackedData, setStackedData] = useState({ labels: [], datasets: [] });
  const [pieData, setPieData] = useState({ labels: [], datasets: [] });
  const [hourTotals, setHourTotals] = useState({ labels: [], totals: [] });
  const [range, setRange] = useState("daily");

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMetrics(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const curH = new Date().getHours();
    const labels = hourLabels24.slice(0, curH + 1);
    const baseV1 = demoHourV1.slice(0, curH + 1);
    const baseV2 = demoHourV2.slice(0, curH + 1);

    if (range === "daily") {
      setStackedData({
        labels,
        datasets: [
          { label: "V1", data: baseV1, backgroundColor: "#0d6efd" },
          { label: "V2", data: baseV2, backgroundColor: "#fd7e14" },
        ],
      });
      setPieData({
        labels: ["V1", "V2"],
        datasets: [
          {
            data: [sumArr(baseV1), sumArr(baseV2)],
            backgroundColor: ["#0d6efd", "#fd7e14"],
          },
        ],
      });
      setHourTotals({ labels, totals: baseV1.map((v, i) => v + baseV2[i]) });
    } else {
      fetch(`/api/admin/weekly-predictions?range=${range}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          const rng = seededRandom(5678);
          const stubV1 = Array(data.labels.length).fill(0).map(() => Math.floor(rng() * 25) + 15);
          const stubV2 = Array(data.labels.length).fill(0).map(() => Math.floor(rng() * 20) + 10);
          const v1 = stubV1.map((d, i) => d + Number(data.v1[i] ?? 0));
          const v2 = stubV2.map((d, i) => d + Number(data.v2[i] ?? 0));

          setStackedData({
            labels: data.labels,
            datasets: [
              { label: "V1", data: v1, backgroundColor: "#0d6efd" },
              { label: "V2", data: v2, backgroundColor: "#fd7e14" },
            ],
          });
          setPieData({
            labels: ["V1", "V2"],
            datasets: [{ data: [sumArr(v1), sumArr(v2)], backgroundColor: ["#0d6efd", "#fd7e14"] }],
          });
          setHourTotals({ labels: [], totals: [] });
        })
        .catch(() => {});
    }
  }, [range]);

  useEffect(() => {
    if (range !== "daily") return;

    const poll = () =>
      fetch("/api/admin/hourly-predictions?hours=24")
        .then((r) => (r.ok ? r.json() : null))
        .then((hr) => {
          if (!hr) return;

          const curH = new Date().getHours();
          const liveV1 = Array(curH + 1).fill(0);
          const liveV2 = Array(curH + 1).fill(0);

          hr.labels.forEach((lab, i) => {
            const h = normHour(lab);
            const idx = hourLabels24.indexOf(h);
            if (idx > -1 && idx <= curH) {
              liveV1[idx] = Number(hr.v1[i] ?? 0);
              liveV2[idx] = Number(hr.v2[i] ?? 0);
            }
          });

          const mergedV1 = demoHourV1.slice(0, curH + 1).map((d, i) => d + liveV1[i]);
          const mergedV2 = demoHourV2.slice(0, curH + 1).map((d, i) => d + liveV2[i]);
          const mergedTotals = mergedV1.map((v, i) => v + mergedV2[i]);

          setStackedData({
            labels: hourLabels24.slice(0, curH + 1),
            datasets: [
              { label: "V1", data: mergedV1, backgroundColor: "#0d6efd" },
              { label: "V2", data: mergedV2, backgroundColor: "#fd7e14" },
            ],
          });
          setPieData({
            labels: ["V1", "V2"],
            datasets: [{ data: [sumArr(mergedV1), sumArr(mergedV2)], backgroundColor: ["#0d6efd", "#fd7e14"] }],
          });
          setHourTotals({ labels: hourLabels24.slice(0, curH + 1), totals: mergedTotals });
        })
        .catch(() => {});

    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, [range]);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <h2>👨💼 DAIVERP Admin Panel</h2>
        </div>
        <img src="/DAIVERPLogo.png" alt="DAIVERP Logo" className="admin-logo" />
      </div>

      <button className="back-button" onClick={() => navigate("/")}>← Back</button>

      <div className="metrics-grid">
        <div className="metric-box">👥 <strong>Active Users:</strong> {metrics.activeUsers}</div>
        <div className="metric-box">📥 <strong>Queue Length:</strong> {metrics.queueLength}</div>
        <div className="metric-box">📊 <strong>Today's Predictions:</strong> {metrics.dailyPredictions}</div>
        <div className="metric-box">🚀 <strong>Model Deployed:</strong> {metrics.modelDeployed}</div>
      </div>

      <div className="range-select">
        <label htmlFor="range">📅 Filter Predictions:</label>{" "}
        <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="daily">Today</option>
          <option value="weekly">Last 7 Days</option>
          <option value="monthly">Last 30 Days</option>
        </select>
      </div>

      <div className="main-chart">
        <Bar
          data={stackedData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" }, title: { display: true, text: "Prediction Volume by Model" } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      <div className="small-charts-row">
        <div className="small-chart-box">
          <h3 className="small-chart-title">Model Usage</h3>
          <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
        </div>

        {range === "daily" && (
          <div className="small-chart-box">
            <h3 className="small-chart-title">Hourly Totals</h3>
            <Bar
              data={{
                labels: hourTotals.labels,
                datasets: [{ data: hourTotals.totals, backgroundColor: "#20c997" }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;

