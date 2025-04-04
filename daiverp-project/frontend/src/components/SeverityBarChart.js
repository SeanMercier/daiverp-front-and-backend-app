import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2"; // Bar chart component
import { Chart as ChartJS } from "chart.js/auto"; 
// "auto" import auto-registers all necessary Chart.js components (axes, legends, etc.)
// Ref: https://www.chartjs.org/docs/latest/getting-started/integration.html

function SeverityBarChart({ predictions }) {
  // === 1. Aggregate severity counts from predictions ===
  // Uses useMemo to avoid recalculation unless `predictions` changes.
  // Ref: https://reactjs.org/docs/hooks-reference.html#usememo
  const severityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, "Very Low": 0 };

    predictions.forEach((row) => {
      // Assumes each row has a `Severity` value already assigned (e.g., "High")
      if (counts[row.Severity] !== undefined) {
        counts[row.Severity]++;
      }
      // If severity label is unrecognized, it is ignored.
    });

    return counts;
  }, [predictions]);

  // === 2. Prepare dataset for Chart.js ===
  // This defines labels and datasets, including the color mapping for each severity level.
  const data = {
    labels: Object.keys(severityCounts), // E.g., ["Critical", "High", "Medium", ...]
    datasets: [
      {
        label: "CVE Count by Severity",
        data: Object.values(severityCounts),
        backgroundColor: [
          "#f50707", // Critical - Red
          "#fc9014", // High - Orange
          "#f2e307", // Medium - Yellow
          "#08a7fc", // Low - Light Blue
          "#07f223", // Very Low - Green
        ],
      },
    ],
  };

  // === 3. Chart customization options ===
  // Controls chart appearance, responsiveness, and scaling.
  // Ref: https://www.chartjs.org/docs/latest/general/options.html
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Hide legend for minimal UI
      title: {
        display: true,
        text: "CVE Count by Severity",
      },
    },
    scales: {
      y: {
        beginAtZero: true,         // Ensures bars start at 0
        ticks: { stepSize: 1 },    // Keep y-axis tick interval to 1
      },
    },
  };

  // === Render Chart ===
  // Wrap in a max-width container to center and control layout
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default SeverityBarChart;

