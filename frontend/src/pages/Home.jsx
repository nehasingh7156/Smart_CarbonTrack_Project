import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiActivity, FiTrendingUp, FiGlobe, FiEye, FiCpu, FiShield, 
  FiArrowRight, FiClock, FiMapPin 
} from "react-icons/fi";

export default function Home() {
  const [hovered, setHovered] = useState(null);
  const [time, setTime] = useState(new Date());
  const plant = localStorage.getItem("plant") || "Bhopal Plant #1";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cards = [
    {
      title: "Monitor Emissions",
      desc: "Track electricity consumption, fuel usage, and production data in real time. Identify inefficiencies and emission hotspots with precision insights.",
      color: "#10b981", /* Emerald */
      icon: <FiActivity />,
      badge: "Real-time",
      path: "/app/data-entry"
    },
    {
      title: "Analyze Trends",
      desc: "Visual dashboards reveal carbon intensity patterns and energy trends to support smarter operational decision-making.",
      color: "#0f766e", /* Teal */
      icon: <FiTrendingUp />,
      badge: "Predictive",
      path: "/app/analytics"
    },
    {
      title: "Improve Sustainability",
      desc: "Adopt cleaner strategies, increase renewable energy usage, and align plant operations with long-term sustainability goals.",
      color: "#22c55e", /* Soft Green */
      icon: <FiGlobe />,
      badge: "Recommendation",
      path: "/app/dashboard"
    },
    {
      title: "Carbon Visibility",
      desc: "Gain plant-level transparency into emissions and understand where operational improvements create the highest impact.",
      color: "#0d9488", /* Mint/Teal */
      icon: <FiEye />,
      badge: "Audited",
      path: "/app/dashboard"
    },
    {
      title: "Operational Efficiency",
      desc: "Use energy intelligence to optimize processes, reduce waste, and enhance productivity while lowering environmental load.",
      color: "#0f172a", /* Deep Navy */
      icon: <FiCpu />,
      badge: "Optimization",
      path: "/app/dashboard"
    },
    {
      title: "Compliance Readiness",
      desc: "Maintain structured emission records aligned with reporting frameworks for audit preparedness and sustainability reporting.",
      color: "#0284c7", /* Light Blue */
      icon: <FiShield />,
      badge: "Regulatory",
      path: "/app/reports"
    }
  ];

  return (
    <div style={styles.page}>
      
      {/* Premium Hero Dashboard Header */}
      <div style={styles.heroHeader}>
        <div style={styles.headerLeft}>
          <div style={styles.platformBadge}>
            <span style={styles.beaconDot} />
            System Status: Online & Secured
          </div>
          <h1 style={styles.heroTitle}>
            Welcome to SmartCarbonTrack
          </h1>
          <p style={styles.heroSubtitle}>
            Industrial Carbon Intelligence Platform & Operational Energy Dashboard
          </p>
          <p style={styles.heroDesc}>
            All plant monitoring nodes are reporting normally. Carbon intensity calculations, 
            Scope 1/2 isolation, and ESG compliance audit records are synchronized.
          </p>
        </div>

        {/* Live Status Cards */}
        <div style={styles.headerRight}>
          <div style={styles.metaCard}>
            <div style={styles.metaIcon}><FiMapPin /></div>
            <div>
              <div style={styles.metaLabel}>Current Plant</div>
              <div style={styles.metaVal}>{plant}</div>
            </div>
          </div>
          <div style={styles.metaCard}>
            <div style={styles.metaIcon}><FiClock /></div>
            <div>
              <div style={styles.metaLabel}>System Time</div>
              <div style={styles.metaVal}>
                {time.toLocaleTimeString()} | {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Visual Dashboard Overview Panel (Emerald Gradient Container) */}
      <div style={styles.overviewPanel}>
        <div style={styles.overviewItem}>
          <span style={styles.overviewDot} />
          <div>
            <span style={styles.overviewLabel}>Active Plant Node</span>
            <strong style={styles.overviewVal}>{plant}</strong>
          </div>
        </div>
        <div style={styles.overviewDivider} />
        <div style={styles.overviewItem}>
          <span style={{ ...styles.overviewDot, background: "#34d399" }} />
          <div>
            <span style={styles.overviewLabel}>Today's Status</span>
            <strong style={{ ...styles.overviewVal, color: "#34d399" }}>Monitoring Active</strong>
          </div>
        </div>
        <div style={styles.overviewDivider} />
        <div style={styles.overviewItem}>
          <span style={{ ...styles.overviewDot, background: "#38bdf8" }} />
          <div>
            <span style={styles.overviewLabel}>AI Forecasting Engine</span>
            <strong style={{ ...styles.overviewVal, color: "#38bdf8" }}>Active & Forecasting</strong>
          </div>
        </div>
        <div style={styles.overviewDivider} />
        <div style={styles.overviewItem}>
          <span style={{ ...styles.overviewDot, background: "#c084fc" }} />
          <div>
            <span style={styles.overviewLabel}>Compliance Status</span>
            <strong style={{ ...styles.overviewVal, color: "#c084fc" }}>Audit Compliant</strong>
          </div>
        </div>
      </div>

      {/* Grid of Feature Modules */}
      <h2 style={styles.gridSectionTitle}>Industrial Analytics Modules</h2>
      
      <div style={styles.grid}>
        {cards.map((card, i) => {
          const isHover = hovered === i;

          return (
            <Link
              key={card.title}
              to={card.path}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="feature-card-glow"
              style={{
                ...styles.card,
                borderTop: `5px solid ${card.color}`,
                transform: isHover ? "translateY(-6px)" : "translateY(0)",
                boxShadow: isHover 
                  ? `0 16px 36px rgba(15, 118, 110, 0.12), 0 0 0 1px ${card.color}25`
                  : "0 4px 20px rgba(15, 23, 42, 0.03)",
                textDecoration: "none"
              }}
            >
              <div style={styles.cardHeader}>
                <div style={{ ...styles.cardIcon, color: card.color, background: `${card.color}12` }}>
                  {card.icon}
                </div>
                <span style={{ ...styles.cardBadge, color: card.color, background: `${card.color}15` }}>
                  {card.badge}
                </span>
              </div>

              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardText}>{card.desc}</p>
              
              <div style={styles.cardFooter}>
                <span style={{ ...styles.learnMore, color: card.color }}>
                  Access Module
                  <FiArrowRight style={{ 
                    transition: "transform 0.25s ease", 
                    transform: isHover ? "translateX(6px)" : "translateX(0)" 
                  }} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Style overrides for custom glowing and layout effects */}
      <style>{`
        @keyframes status-blink {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .feature-card-glow {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1300px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  heroHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "32px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(16, 185, 129, 0.15)",
    padding: "36px 40px",
    borderRadius: "24px",
    boxShadow: "0 4px 30px rgba(15, 118, 110, 0.03)"
  },

  headerLeft: {
    flex: "1 1 500px"
  },

  platformBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    background: "rgba(16, 185, 129, 0.1)",
    color: "#047857",
    padding: "4px 10px",
    borderRadius: "30px",
    marginBottom: "16px"
  },

  beaconDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#10b981",
    animation: "status-blink 2s ease-in-out infinite"
  },

  heroTitle: {
    fontSize: "36px",
    fontWeight: 900,
    margin: 0,
    color: "#0f172a", /* Rich Navy */
    letterSpacing: "-1px"
  },

  heroSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f766e" /* Teal accent */
  },

  heroDesc: {
    margin: "18px 0 0 0",
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.6"
  },

  headerRight: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: "0 0 320px",
    width: "100%"
  },

  metaCard: {
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: "16px 20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.01)"
  },

  metaIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "rgba(15, 118, 110, 0.08)",
    color: "#0f766e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },

  metaLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  metaVal: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#0f172a",
    marginTop: "2px"
  },

  overviewPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    background: "linear-gradient(135deg, #094a43 0%, #0f766e 100%)",
    border: "1px solid rgba(52, 211, 153, 0.25)",
    color: "#ffffff",
    padding: "24px 32px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(15, 118, 110, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
    alignItems: "center"
  },

  overviewItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  overviewDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "inline-block"
  },

  overviewLabel: {
    display: "block",
    fontSize: "10px",
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  overviewVal: {
    display: "block",
    fontSize: "14px",
    color: "#ffffff",
    marginTop: "2px",
    fontWeight: 700
  },

  overviewDivider: {
    width: "1px",
    height: "30px",
    background: "rgba(255, 255, 255, 0.15)",
    alignSelf: "center",
    display: "block"
  },

  gridSectionTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
    margin: "8px 0 -8px 0",
    letterSpacing: "-0.5px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px"
  },

  card: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    padding: "28px 30px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    cursor: "pointer",
    boxSizing: "border-box"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px"
  },

  cardBadge: {
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "3px 10px",
    borderRadius: "20px"
  },

  cardTitle: {
    fontSize: "19px",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px 0",
    letterSpacing: "-0.3px"
  },

  cardText: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.6",
    margin: "0 0 24px 0",
    flexGrow: 1
  },

  cardFooter: {
    display: "flex",
    alignItems: "center"
  },

  learnMore: {
    fontSize: "13px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px"
  }
};
