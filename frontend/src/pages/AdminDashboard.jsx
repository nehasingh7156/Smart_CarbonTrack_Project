import { useNavigate } from "react-router-dom";
import { FaIndustry, FaExclamationTriangle, FaCheckCircle, FaChartLine } from "react-icons/fa";
import { FiActivity, FiLayers, FiAlertCircle, FiCpu } from "react-icons/fi";
import AdminReports from "../components/AdminReports";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock plants with random logical data
  const plants = [
    { name: "Bhopal", footprintValue: 8500, threshold: 8000, production: 120000 },
    { name: "Delhi", footprintValue: 12000, threshold: 10000, production: 155000 },
    { name: "Mumbai", footprintValue: 4200, threshold: 5000, production: 80000 },
    { name: "Pune", footprintValue: 9100, threshold: 9500, production: 130000 },
    { name: "Chennai", footprintValue: 6700, threshold: 7000, production: 110000 },
    { name: "Hyderabad", footprintValue: 10500, threshold: 10000, production: 145000 }
  ];

  // Calculate totals for KPI widgets
  const totalPlants = plants.length;
  const totalFootprint = plants.reduce((sum, p) => sum + p.footprintValue, 0);
  const activeHotspots = plants.filter(p => p.footprintValue > p.threshold).length;
  const totalProduction = plants.reduce((sum, p) => sum + p.production, 0);

  return (
    <div style={styles.container}>
      
      {/* HEADER SECTION */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        <h1 style={styles.title}>
          <FiCpu style={{ marginRight: 10, verticalAlign: "middle" }} /> Plant Overview Dashboard
        </h1>
        <p style={styles.subtitle}>
          Monitor cross-plant carbon metrics, track efficiency ratios, and identify critical emission hotspots.
        </p>
      </div>

      {/* ADMIN STATS SUMMARY ROW */}
      <div style={styles.statsRow}>
        
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, background: "rgba(15, 118, 110, 0.08)", color: "#0f766e" }}>
            <FiLayers size={22} />
          </div>
          <div>
            <div style={styles.statLabel}>Monitored Nodes</div>
            <div style={styles.statVal}>{totalPlants} Plants</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}>
            <FiActivity size={22} />
          </div>
          <div>
            <div style={styles.statLabel}>Cumulative Carbon</div>
            <div style={styles.statVal}>{(totalFootprint / 1000).toFixed(1)}k MT</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, background: activeHotspots > 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(16, 185, 129, 0.08)", color: activeHotspots > 0 ? "#f59e0b" : "#10b981" }}>
            <FiAlertCircle size={22} />
          </div>
          <div>
            <div style={styles.statLabel}>Active Hotspots</div>
            <div style={styles.statVal}>{activeHotspots} Alerts</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, background: "rgba(59, 130, 246, 0.08)", color: "#3b82f6" }}>
            <FaChartLine size={20} />
          </div>
          <div>
            <div style={styles.statLabel}>Cumulative Production</div>
            <div style={styles.statVal}>{totalProduction.toLocaleString()} Units</div>
          </div>
        </div>

      </div>

      {/* PLANT GRID */}
      <div style={styles.grid}>
        {plants.map((plant) => {
          const isHigh = plant.footprintValue > plant.threshold;
          const ratioPercent = Math.min(100, Math.round((plant.footprintValue / plant.threshold) * 100));

          return (
            <div
              key={plant.name}
              style={styles.card}
              onClick={() => navigate(`/admin/plant/${plant.name}`)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  <FaIndustry size={18} color="#0f766e" />
                </div>
                <div>
                  <h2 style={styles.cardTitle}>{plant.name} Node</h2>
                  <span style={styles.plantTag}>Industrial Complex</span>
                </div>
              </div>

              <div style={styles.metricsBox}>
                
                {/* Metric 1 */}
                <div style={styles.metricItem}>
                  <p style={styles.metricLabel}>Carbon Threshold Status</p>
                  <div style={{ ...styles.indicator, color: isHigh ? "#ef4444" : "#10b981" }}>
                    {isHigh ? <FaExclamationTriangle size={18} /> : <FaCheckCircle size={18} />}
                    <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "0.5px" }}>
                      {isHigh ? "THRESHOLD EXCEEDED" : "UNDER REGULATORY CAP"}
                    </span>
                  </div>
                </div>

                {/* Footprint vs Threshold bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                    <span>Cap Utilization</span>
                    <span>{ratioPercent}%</span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={{
                      ...styles.progressBarFill,
                      width: `${ratioPercent}%`,
                      background: isHigh ? "linear-gradient(90deg, #ef4444, #f87171)" : "linear-gradient(90deg, #10b981, #34d399)"
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>
                    <span>{plant.footprintValue.toLocaleString()} MT</span>
                    <span>Cap: {plant.threshold.toLocaleString()} MT</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div style={{ ...styles.metricItem, borderTop: "1px dashed #e2e8f0", paddingTop: 14 }}>
                  <p style={styles.metricLabel}>Active Production Rate</p>
                  <div style={{ ...styles.indicator, color: "#1e293b" }}>
                    <FaChartLine size={18} color="#3b82f6" />
                    <span style={{ fontWeight: 800, fontSize: "14px" }}>
                      {plant.production.toLocaleString()} units / month
                    </span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* EMBEDDED REPORTS SECTION */}
      <div style={styles.reportsSection}>
        <AdminReports />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    fontFamily: "'Inter', sans-serif"
  },
  title: {
    fontSize: "30px",
    fontWeight: "900",
    color: "#0f766e",
    margin: 0,
    letterSpacing: "-0.5px"
  },
  subtitle: {
    fontSize: "15px",
    color: "#475569",
    margin: 0,
    fontWeight: 500,
    lineHeight: 1.5
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px"
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
    border: "1px solid rgba(226, 232, 240, 0.8)"
  },
  statIconContainer: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "4px"
  },
  statVal: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#0f172a"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px"
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    cursor: "pointer",
    transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "14px"
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "rgba(15, 118, 110, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a"
  },
  plantTag: {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase"
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
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    color: "#94a3b8",
    letterSpacing: "0.5px"
  },
  indicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  progressBarBg: {
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "3px",
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease-in-out"
  },
  reportsSection: {
    marginTop: "20px",
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
    paddingTop: "32px"
  }
};

// Add standard hover animations dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  div[style*="cursor: pointer"]:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06) !important;
    border-color: rgba(15, 118, 110, 0.2) !important;
  }
`;
document.head.appendChild(styleSheet);
