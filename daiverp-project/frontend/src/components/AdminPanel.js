import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import "./AdminPanel.css";
import { useNavigate } from "react-router-dom";

/* ────── persistent demo seed (saved in localStorage) ────── */
const hourLabels24 = Array.from({ length: 24 }, (_, h) =>
  `${String(h).padStart(2, "0")}:00`
);
const DEMO_KEY = "daiverpDemoSeed";

function loadDemoSeed() {
  const cached = localStorage.getItem(DEMO_KEY);
  if (cached) return JSON.parse(cached);

  /* first run → create once, then cache */
  const v1 = hourLabels24.map(() => Math.floor(Math.random() * 10) + 3); // 3‑12
  const v2 = hourLabels24.map(() => Math.floor(Math.random() * 8) + 2);  // 2‑9
  localStorage.setItem(DEMO_KEY, JSON.stringify({ v1, v2 }));
  return { v1, v2 };
}
const { v1: demoV1, v2: demoV2 } = loadDemoSeed();

/* helpers */
const sumArr = (arr) => arr.reduce((s, n) => s + n, 0);
function mergeSeries(labelsA, dataA, labelsB, dataB) {
  const map = new Map();
  labelsA.forEach((l, i) => map.set(l, (map.get(l) || 0) + dataA[i]));
  labelsB.forEach((l, i) => map.set(l, (map.get(l) || 0) + Number(dataB[i])));
  const mergedLabels = [...map.keys()];
  const mergedData = mergedLabels.map((l) => map.get(l));
  return { mergedLabels, mergedData };
}

function AdminPanel() {
  /* metric cards */
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    queueLength: 0,
    dailyPredictions: 0,
    modelDeployed: "N/A",
  });

  /* charts (seeded with demo) */
  const [stackedData, setStackedData] = useState({
    labels: hourLabels24,
    datasets: [
      { label: "V1 Predictions", data: demoV1, backgroundColor: "#0d6efd" },
      { label: "V2 Predictions", data: demoV2, backgroundColor: "#fd7e14" },
    ],
  });
  const [totalsData, setTotalsData] = useState({
    labels: hourLabels24,
    totals: demoV1.map((v, i) => v + demoV2[i]),
  });
  const [pieData, setPieData] = useState({
    labels: ["V1 Predictions", "V2 Predictions"],
    datasets: [
      {
        data: [sumArr(demoV1), sumArr(demoV2)],
        backgroundColor: ["#0d6efd", "#fd7e14"],
        hoverOffset: 6,
      },
    ],
  });

  const [range, setRange] = useState("all");
  const navigate = useNavigate();

  /* fetch metric cards once */
  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMetrics(d))
      .catch(() => {});
  }, []);

  /* MAIN effect: merge weekly (day) + hourly (24 h) into demo */
  useEffect(() => {
    fetch(`/api/admin/weekly-predictions?range=${range}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;

        /* merge demo + weekly data for V1 & V2 */
        const m1 = mergeSeries(
          stackedData.labels,
          stackedData.datasets[0].data,
          data.labels,
          data.v1
        );
        const m2 = mergeSeries(
          stackedData.labels,
          stackedData.datasets[1].data,
          data.labels,
          data.v2
        );
        const mergedLabels = [...new Set([...m1.mergedLabels, ...m2.mergedLabels])];
        const align = (labs, dat) =>
          mergedLabels.map((lab) => {
            const idx = labs.indexOf(lab);
            return idx > -1 ? dat[idx] : 0;
          });
        const v1Merged = align(m1.mergedLabels, m1.mergedData);
        const v2Merged = align(m2.mergedLabels, m2.mergedData);

        /* update stacked chart & pie */
        setStackedData({
          labels: mergedLabels,
          datasets: [
            { label: "V1 Predictions", data: v1Merged, backgroundColor: "#0d6efd" },
            { label: "V2 Predictions", data: v2Merged, backgroundColor: "#fd7e14" },
          ],
        });
        setPieData({
          labels: ["V1 Predictions", "V2 Predictions"],
          datasets: [
            {
              data: [sumArr(v1Merged), sumArr(v2Merged)],
              backgroundColor: ["#0d6efd", "#fd7e14"],
              hoverOffset: 6,
            },
          ],
        });

        /* --- SECOND call: live hourly counts ---- */
        fetch("/api/admin/hourly-predictions?hours=24")
          .then((r) => (r.ok ? r.json() : null))
          .then((hr) => {
            if (!hr) return;

            /* live per‑hour totals */
            const liveTotals = hr.v1.map((v, i) => v + hr.v2[i]);

            /* merge demo+weekly totals with live hourly */
            const currentTotals = hourLabels24.map((h, i) => {
              const existing = totalsData.totals[i] || 0;
              return existing + liveTotals[i];
            });
            setTotalsData({ labels: hourLabels24, totals: currentTotals });
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, [range]); // re‑run when range selector changes

  return (
    <div className="admin-panel">
      {/* header */}
      <div className="admin-header">
        <div className="admin-title">
          <h2>👨💼 DAIVERP Admin Panel</h2>
          <p>Predictive demo data merges with live results.</p>
        </div>
        <img src="/DAIVERPLogo.png" alt="DAIVERP Logo" className="admin-logo" />
      </div>

      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to User Dashboard
      </button>

      {/* metric cards */}
      <div className="metrics-grid">
        <div className="metric-box">👥 <strong>Active Users:</strong> {metrics.activeUsers}</div>
        <div className="metric-box">📥 <strong>Queue Length:</strong> {metrics.queueLength}</div>
        <div className="metric-box">📊 <strong>Today's Predictions:</strong> {metrics.dailyPredictions}</div>
        <div className="metric-box">🚀 <strong>Model Deployed:</strong> {metrics.modelDeployed}</div>
      </div>

      {/* range selector */}
      <div className="range-select">
        <label htmlFor="range">📅 Filter Predictions:</label>{" "}
        <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="all">All Time</option>
          <option value="monthly">Last 30 Days</option>
          <option value="weekly">Last 7 Days</option>
          <option value="daily">Last 24 Hours</option>
        </select>
      </div>

      {/* main bar chart */}
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

      {/* small charts row */}
      <div className="small-charts-row">
        {/* pie */}
        <div className="small-chart-box">
          <h3 className="small-chart-title">Model Usage (merged)</h3>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const total = ctx.dataset.data.reduce((s, n) => s + n, 0);
                      const pct = ((ctx.parsed / total) * 100).toFixed(1);
                      return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>

        {/* hourly totals bar */}
        <div className="small-chart-box">
          <h3 className="small-chart-title">Hourly Totals (merged)</h3>
          <Bar
            data={{
              labels: totalsData.labels,
              datasets: [
                {
                  label: "Hourly Predictions",
                  data: totalsData.totals,
                  backgroundColor: "#20c997",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

