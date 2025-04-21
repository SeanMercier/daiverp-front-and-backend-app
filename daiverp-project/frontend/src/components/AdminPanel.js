/*  ────────────────────────────────────────────────────────────
    AdminPanel.js (hour‑alignment patch, 2025‑04‑22)
    – NEW: curUTC is read from   hr.labels.at(-1)   instead of the
           browser clock during polling, eliminating any DST / skew.
    — Everything else unchanged.
    ──────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import "./AdminPanel.css";
import { useNavigate } from "react-router-dom";

/* ───────── constants & helpers ───────── */
const hourLabels24 = Array.from({ length: 24 }, (_, h) =>
  `${String(h).padStart(2, "0")}:00`
);
const DEMO_KEY = "daiverpDemoSeed";

function seededRandom(seed) {
  return function () {
    seed = Math.sin(seed) * 10000;
    return seed - Math.floor(seed);
  };
}
const rndForLabel = (str) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
};

/* persistent demo */
function loadDemoSeed() {
  const cached = localStorage.getItem(DEMO_KEY);
  if (cached) return JSON.parse(cached);
  const rng = seededRandom(1234);
  const demo = {
    v1: hourLabels24.map(() => Math.floor(rng() * 10) + 3),
    v2: hourLabels24.map(() => Math.floor(rng() * 8) + 2),
  };
  localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
  return demo;
}
const { v1: demoHourV1, v2: demoHourV2 } = loadDemoSeed();

const sumArr = (a) => a.reduce((s, n) => s + n, 0);
const normHour = (h) => /^\d{2}:\d{2}$/.test(h) ? h : `${h}:00`;
const lastNDays = (n) =>
  Array.from({ length: n }, (_, i) =>
    new Date(Date.now() - (n - 1 - i) * 864e5).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    })
  );

/* ───────── component ───────── */
function AdminPanel() {
  const navigate = useNavigate();

  const [metrics, setMetrics]     = useState({ activeUsers: 0, queueLength: 0, dailyPredictions: 0, modelDeployed: "N/A" });
  const [stackedData, setStackedData] = useState({ labels: [], datasets: [] });
  const [pieData, setPieData]     = useState({ labels: [], datasets: [] });
  const [hourTotals, setHourTotals] = useState({ labels: [], totals: [] });
  const [range, setRange]         = useState("daily");

  /* metric cards */
  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMetrics(d))
      .catch(() => {});
  }, []);

  /* charts on range change */
  useEffect(() => {
    if (range === "daily") {
      const curUTC = new Date().getUTCHours();
      const labels = hourLabels24.slice(0, curUTC + 1);
      const baseV1 = demoHourV1.slice(0, curUTC + 1);
      const baseV2 = demoHourV2.slice(0, curUTC + 1);

      setStackedData({
        labels,
        datasets: [
          { label: "V1", data: baseV1, backgroundColor: "#0d6efd" },
          { label: "V2", data: baseV2, backgroundColor: "#fd7e14" },
        ],
      });
      setHourTotals({ labels, totals: baseV1.map((v, i) => v + baseV2[i]) });
      setPieData({
        labels: ["V1", "V2"],
        datasets: [{ data: [sumArr(baseV1), sumArr(baseV2)], backgroundColor: ["#0d6efd", "#fd7e14"] }],
      });
      return;
    }

    const days = range === "weekly" ? 7 : 30;
    const dayLabels = lastNDays(days);

    fetch(`/api/admin/weekly-predictions?range=${range}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const apiMap =
          data && Array.isArray(data.labels)
            ? new Map(
                data.labels.map((l, i) => [
                  l,
                  { v1: data.v1[i] ?? 0, v2: data.v2[i] ?? 0 },
                ])
              )
            : new Map();

        const v1 = [];
        const v2 = [];
        dayLabels.forEach((lab, i) => {
          const api = apiMap.get(lab) ?? { v1: 0, v2: 0 };
          const amp  = 1 + rndForLabel("amp" + lab) * 5;
          const phi  = rndForLabel("phi" + lab) * 2 * Math.PI;
          const base1 = Math.floor(rndForLabel("b1" + lab) * 16) + 15;
          const base2 = Math.floor(rndForLabel("b2" + lab) * 11) + 10;
          v1.push(Math.round(base1 + amp * Math.sin(i / 2 + phi)) + api.v1);
          v2.push(Math.round(base2 + (amp - 1) * Math.cos(i / 2 + phi)) + api.v2);
        });

        setStackedData({
          labels: dayLabels,
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
  }, [range]);

  /* live polling (hourly) */
  useEffect(() => {
    if (range !== "daily") return;

    const poll = () =>
      fetch("/api/admin/hourly-predictions?hours=24")
        .then((r) => (r.ok ? r.json() : null))
        .then((hr) => {
          if (!hr || !Array.isArray(hr.labels) || hr.labels.length === 0) return;

          /* derive current hour from server’s last label */
          const lastLabel = hr.labels[hr.labels.length - 1];   // e.g. "17:00"
          const curUTC    = parseInt(lastLabel.split(":")[0], 10);
          const labels    = hourLabels24.slice(0, curUTC + 1);

          const liveV1 = Array(curUTC + 1).fill(0);
          const liveV2 = Array(curUTC + 1).fill(0);
          hr.labels.forEach((lab, i) => {
            const idx = labels.indexOf(normHour(lab));
            if (idx !== -1) {
              liveV1[idx] = Number(hr.v1[i] || 0);
              liveV2[idx] = Number(hr.v2[i] || 0);
            }
          });

          const mergedV1 = demoHourV1.slice(0, curUTC + 1).map((d, i) => d + liveV1[i]);
          const mergedV2 = demoHourV2.slice(0, curUTC + 1).map((d, i) => d + liveV2[i]);
          const mergedTotals = mergedV1.map((v, i) => v + mergedV2[i]);

          setStackedData({
            labels,
            datasets: [
              { label: "V1", data: mergedV1, backgroundColor: "#0d6efd" },
              { label: "V2", data: mergedV2, backgroundColor: "#fd7e14" },
            ],
          });
          setHourTotals({ labels, totals: mergedTotals });
          setPieData({
            labels: ["V1", "V2"],
            datasets: [{ data: [sumArr(mergedV1), sumArr(mergedV2)], backgroundColor: ["#0d6efd", "#fd7e14"] }],
          });
        })
        .catch(() => {});

    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, [range]);

  /* ─────────── UI ─────────── */
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title"><h2>👨💼 DAIVERP Admin Panel</h2></div>
        <img src="/DAIVERPLogo.png" alt="DAIVERP Logo" className="admin-logo" />
      </div>

      <button className="back-button" onClick={() => navigate("/")}>← Back</button>

      <div className="metrics-grid">
        <div className="metric-box">👥 <strong>Active Users:</strong> {metrics.activeUsers}</div>
        <div className="metric-box">📥 <strong>Queue Length:</strong> {metrics.queueLength}</div>
        <div className="metric-box">📊 <strong>Today's Predictions:</strong> {metrics.dailyPredictions}</div>
        <div className="metric-box">🚀 <strong>Model Deployed:</strong> {metrics.modelDeployed}</div>
      </div>

      <div className="range-select">
        <label htmlFor="range">📅 Filter Predictions: </label>
        <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="daily">Today (UTC)</option>
          <option value="weekly">Last 7 Days</option>
          <option value="monthly">Last 30 Days</option>
        </select>
      </div>

      <div className="main-chart">
        <Bar
          data={stackedData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Prediction Volume by Model" },
            },
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
            <h3 className="small-chart-title">Hourly Totals (UTC)</h3>
            <Bar
              data={{ labels: hourTotals.labels, datasets: [{ data: hourTotals.totals, backgroundColor: "#20c997" }] }}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;

