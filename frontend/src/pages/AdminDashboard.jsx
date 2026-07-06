import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaIndustry, FaExclamationTriangle, FaCheckCircle, FaChartLine } from "react-icons/fa";
import AdminReports from "../components/AdminReports";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock plants with random logical data since there isn't a "get all plants" backend route
  const plants = [
    { name: "Bhopal", footprintValue: 8500, threshold: 8000, production: 120000 },
    { name: "Delhi", footprintValue: 12000, threshold: 10000, production: 155000 },
    { name: "Mumbai", footprintValue: 4200, threshold: 5000, production: 80000 },
    { name: "Pune", footprintValue: 9100, threshold: 9500, production: 130000 },
    { name: "Chennai", footprintValue: 6700, threshold: 7000, production: 110000 },
    { name: "Hyderabad", footprintValue: 10500, threshold: 10000, production: 145000 }
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Plant Overview Dashboard</h1>
      <p style={styles.subtitle}>
        Monitor cross-plant carbon metrics and identify critical emission hotspots.
      </p>

      <div style={styles.grid}>
        {plants.map((plant) => {
          const isHigh = plant.footprintValue > plant.threshold;

          return (
            <div
              key={plant.name}
              style={styles.card}
              onClick={() => navigate(`/admin/plant/${plant.name}`)}
            >
              <div style={styles.cardHeader}>
                <FaIndustry style={styles.iconBase} />
                <h2 style={styles.cardTitle}>{plant.name}</h2>
              </div>

              <div style={styles.metricsBox}>
                <div style={styles.metricItem}>
                  <p style={styles.metricLabel}>Carbon Alert</p>
                  <div style={{ ...styles.indicator, color: isHigh ? "#dc2626" : "#16a34a" }}>
                    {isHigh ? <FaExclamationTriangle size={24} /> : <FaCheckCircle size={24} />}
                    <span style={{ fontWeight: 700, fontSize: "16px" }}>
                      {isHigh ? "HIGH" : "LOW"}
                    </span>
                  </div>
                </div>

                <div style={styles.metricItem}>
                  <p style={styles.metricLabel}>Production Rate</p>
                  <div style={{ ...styles.indicator, color: "#2563eb" }}>
                    <FaChartLine size={24} />
                    <span style={{ fontWeight: 700, fontSize: "16px" }}>
                      {plant.production.toLocaleString()} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", borderTop: "2px solid #cbd5e1", paddingTop: "40px" }}>
        <AdminReports />
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  title: {
    fontSize: "36px",
    fontWeight: "900",
    color: "#0f766e",
    margin: 0
  },
  subtitle: {
    fontSize: "18px",
    color: "#134e4a",
    margin: 0,
    marginBottom: "20px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px"
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "16px"
  },
  iconBase: {
    fontSize: "28px",
    color: "#0f766e"
  },
  cardTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
    color: "#1e293b"
  },
  metricsBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  metricItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  metricLabel: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#64748b",
    letterSpacing: "0.5px"
  },
  indicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  div[style*="cursor: pointer"]:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
  }
`;
document.head.appendChild(styleSheet);
