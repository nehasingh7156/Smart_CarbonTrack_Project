import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaIndustry, FaExclamationTriangle, FaCheckCircle, FaChartLine } from "react-icons/fa";
import { FiActivity, FiLayers, FiAlertCircle, FiClock, FiPlus, FiTrash2, FiSearch, FiLoader } from "react-icons/fi";
import AdminReports from "../components/AdminReports";
const API_BASE = import.meta.env.VITE_API_URL;

const PLANT_CAPS = {
  "Bhopal": 8000,
  "Delhi": 10000,
  "Mumbai": 5000,
  "Pune": 9500,
  "Chennai": 7000,
  "Hyderabad": 10000
};
const DEFAULT_CAP = 7500;

// Subtle industrial factory outline background illustration
const FactoryOutlineSvg = () => (
  <svg
    viewBox="0 0 100 100"
    style={{
      position: "absolute",
      right: 12,
      bottom: 8,
      width: 100,
      height: 100,
      opacity: 0.06,
      color: "#0f766e",
      pointerEvents: "none",
      zIndex: 0
    }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 85h80V55l-20 12V45l-20 12V35L30 45v40H10z" />
    <line x1="38" y1="35" x2="38" y2="45" />
    <line x1="45" y1="35" x2="45" y2="57" />
    <rect x="18" y="70" width="8" height="8" rx="1" />
    <rect x="58" y="70" width="8" height="8" rx="1" />
    <path d="M38 25a3 3 0 0 1 3-3" />
    <path d="M45 23a4 4 0 0 1 4-4" />
  </svg>
);

// Globe with connected plant nodes on the hero banner
const GlobeNetworkSvg = () => (
  <svg
    width="160"
    height="160"
    viewBox="0 0 100 100"
    style={{
      opacity: 0.85,
      color: "#ffffff",
      pointerEvents: "none",
      flexShrink: 0
    }}
  >
    {/* Globe grid circles */}
    <circle cx="50" cy="50" r="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    <ellipse cx="50" cy="50" rx="35" ry="12" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    <ellipse cx="50" cy="50" rx="12" ry="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    
    {/* Connected nodes */}
    <circle cx="50" cy="15" r="3.5" fill="#10b981" />
    <circle cx="20" cy="40" r="3.5" fill="#10b981" />
    <circle cx="80" cy="40" r="3.5" fill="#10b981" />
    <circle cx="35" cy="75" r="3.5" fill="#10b981" />
    <circle cx="65" cy="75" r="3.5" fill="#10b981" />
    
    {/* Connection lines */}
    <line x1="50" y1="15" x2="20" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    <line x1="50" y1="15" x2="80" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    <line x1="20" y1="40" x2="35" y2="75" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    <line x1="80" y1="40" x2="65" y2="75" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    <line x1="35" y1="75" x2="65" y2="75" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    <line x1="50" y1="15" x2="50" y2="85" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
    
    {/* Node pulse animations */}
    <circle cx="50" cy="15" r="6" stroke="#10b981" strokeWidth="1" fill="none" className="node-pulse-1" />
    <circle cx="35" cy="75" r="6" stroke="#10b981" strokeWidth="1" fill="none" className="node-pulse-2" />
    <circle cx="80" cy="40" r="6" stroke="#10b981" strokeWidth="1" fill="none" className="node-pulse-3" />
  </svg>
);

// Dynamic animated background elements
const DashboardBackground = () => (
  <div style={styles.bgContainer}>
    {/* Subtle Grid Overlay */}
    <div style={styles.gridOverlay} />
    
    {/* Floating Bubble Particles */}
    <div className="floating-bubble" style={{ ...styles.bubble, left: "8%", top: "15%", width: 90, height: 90, background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", animationDelay: "0s" }} />
    <div className="floating-bubble" style={{ ...styles.bubble, left: "78%", top: "25%", width: 140, height: 140, background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", animationDelay: "-4s" }} />
    <div className="floating-bubble" style={{ ...styles.bubble, left: "38%", top: "65%", width: 110, height: 110, background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)", animationDelay: "-8s" }} />
    <div className="floating-bubble" style={{ ...styles.bubble, left: "85%", top: "72%", width: 85, height: 85, background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", animationDelay: "-2s" }} />

    {/* Background Industrial Skyline SVG */}
    <svg
      viewBox="0 0 1000 300"
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "100%",
        height: "220px",
        opacity: 0.05,
        color: "#0f766e",
        pointerEvents: "none"
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M 0 250 L 50 250 L 50 200 L 70 210 L 70 180 L 90 190 L 90 170 L 120 170 L 120 250 L 200 250 L 200 210 L 240 210 L 240 250 L 300 250" />
      
      {/* Wind Turbine 1 */}
      <line x1="450" y1="250" x2="450" y2="120" />
      <g className="spin-slow" style={{ transformOrigin: "450px 120px" }}>
        <line x1="450" y1="120" x2="450" y2="70" />
        <line x1="450" y1="120" x2="407" y2="145" />
        <line x1="450" y1="120" x2="493" y2="145" />
      </g>
      
      {/* Wind Turbine 2 */}
      <line x1="600" y1="250" x2="600" y2="150" />
      <g className="spin-slower" style={{ transformOrigin: "600px 150px" }}>
        <line x1="600" y1="150" x2="600" y2="105" />
        <line x1="600" y1="150" x2="561" y2="172" />
        <line x1="600" y1="150" x2="639" y2="172" />
      </g>
      
      {/* Trees outline */}
      <path d="M 330 250 L 340 220 L 335 220 L 345 200 L 340 200 L 350 180 L 360 200 L 355 200 L 365 220 L 360 220 L 370 250 Z" fill="rgba(16, 185, 129, 0.15)" />
      <path d="M 380 250 L 390 230 L 385 230 L 395 210 L 390 210 L 400 190 L 410 210 L 405 210 L 415 230 L 410 230 L 420 250 Z" fill="rgba(16, 185, 129, 0.15)" />
      
      {/* Solar Panel outline */}
      <polygon points="260,250 280,225 310,225 290,250" />
      <line x1="270" y1="250" x2="295" y2="225" />
      <line x1="280" y1="250" x2="305" y2="225" />
      <line x1="270" y1="237" x2="295" y2="237" />
      
      {/* Ground line */}
      <line x1="0" y1="250" x2="1000" y2="250" />
    </svg>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [allEntries, setAllEntries] = useState([]);
  const [plantsList, setPlantsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantState, setNewPlantState] = useState("");
  const [newPlantCity, setNewPlantCity] = useState("");
  const [plantToDelete, setPlantToDelete] = useState(null); // { id: "...", name: "..." }
  const [notification, setNotification] = useState(null); // { type: "success" | "error", message: "..." }

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => { setNotification(null); }, 4000);
  };

  const fetchData = async () => {
    try {
      const [entriesRes, plantsRes] = await Promise.all([
        fetch(`${API_BASE}/api/carbon/all-entries`),
        fetch(`${API_BASE}/api/carbon/plants-list`)
      ]);
      
      const entriesData = entriesRes.ok ? await entriesRes.json() : [];
      const plantsData = plantsRes.ok ? await plantsRes.json() : { success: false, data: [] };

      setAllEntries(entriesData);
      if (plantsData.success) {
        setPlantsList(plantsData.data);
      }
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddPlant = async () => {
    const trimmedName = newPlantName.trim();
    const trimmedState = newPlantState.trim();
    const trimmedCity = newPlantCity.trim();

    if (!trimmedName) {
      showToast("Plant Name is required.", "error");
      return;
    }
    if (!trimmedState) {
      showToast("State name is required.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/carbon/admin/plant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin"
        },
        body: JSON.stringify({
          name: trimmedName,
          state: trimmedState,
          city: trimmedCity
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showToast(result.message || "Plant added successfully.", "success");
        setShowAddModal(false);
        setNewPlantName("");
        setNewPlantState("");
        setNewPlantCity("");
        fetchData();
      } else {
        showToast(result.message || "Failed to add plant.", "error");
      }
    } catch (err) {
      console.error("Add plant network error:", err);
      showToast("Failed to add plant.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlant = async () => {
    if (!plantToDelete) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/carbon/admin/plant/${plantToDelete.id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": "admin"
        }
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showToast(result.message || "Plant deleted successfully.", "success");
        setPlantToDelete(null);
        fetchData();
      } else {
        showToast(result.message || "Failed to delete plant.", "error");
      }
    } catch (err) {
      console.error("Delete plant network error:", err);
      showToast("Failed to delete plant.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getPlantMetrics = () => {
    return plantsList.map(plantObj => {
      const plantName = plantObj.name;
      const plantRecords = allEntries.filter(e => e.plant?.trim().toLowerCase() === plantName.toLowerCase());

      if (plantRecords.length === 0) {
        return {
          id: plantObj._id,
          name: plantName,
          state: plantObj.state,
          city: plantObj.city,
          footprintValue: 0,
          threshold: PLANT_CAPS[plantName] || DEFAULT_CAP,
          production: 0,
          lastUpdated: "No Data Available",
          hasData: false
        };
      }

      const sorted = plantRecords.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      const latest = sorted[0];
      const footprint = latest.kpis?.totalCarbonMT ? parseFloat(latest.kpis.totalCarbonMT) : 0;
      const production = latest.inputs?.beverageProduction || latest.inputs?.production || 0;
      const threshold = PLANT_CAPS[plantName] || DEFAULT_CAP;

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedMonth = monthNames[latest.month - 1] || `Month ${latest.month}`;
      const lastUpdatedStr = `${formattedMonth} ${latest.year}`;

      return {
        id: plantObj._id,
        name: plantName,
        state: plantObj.state,
        city: plantObj.city,
        footprintValue: footprint,
        threshold: threshold,
        production: production,
        lastUpdated: lastUpdatedStr,
        hasData: true
      };
    });
  };

  const plants = getPlantMetrics();

  const filteredPlants = plants.filter(p => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const nameMatch = p.name.toLowerCase().includes(query);
    const stateMatch = (p.state || "").toLowerCase().includes(query);
    const cityMatch = (p.city || "").toLowerCase().includes(query);
    return nameMatch || stateMatch || cityMatch;
  });

  const totalPlants = plants.length;
  const activeNodesCount = plants.filter(p => p.hasData).length;
  const totalFootprint = plants.reduce((sum, p) => sum + p.footprintValue, 0);
  const activeHotspots = plants.filter(p => p.hasData && p.footprintValue > p.threshold).length;
  const totalProduction = plants.reduce((sum, p) => sum + p.production, 0);

  const formatCarbonVal = (val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k MT`;
    }
    return `${val.toFixed(0)} MT`;
  };

  return (
    <div style={styles.container}>
      {/* Animated background */}
      <DashboardBackground />

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          backgroundColor: notification.type === "success" ? "#10b981" : "#ef4444",
          color: "white",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 9999,
          fontWeight: 700,
          animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
          {notification.type === "success" ? <FaCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}
      
      {/* TOP PREMIUM HERO BANNER */}
      <div style={styles.heroBanner}>
        {/* Decorative Grid background inside hero */}
        <div style={styles.heroGridBg} />
        
        <div style={{ display: "flex", flexDirection: "column", gap: 8, zIndex: 2 }}>
          <h1 style={styles.heroTitle}>
            Enterprise Carbon Intelligence Center
          </h1>
          <p style={styles.heroSubtitle}>
            Monitor every manufacturing facility, manage users, oversee sustainability performance, and drive organization-wide ESG excellence.
          </p>
        </div>
        
        {/* Animated Globe right section */}
        <GlobeNetworkSvg />
      </div>

      {/* ADMIN STATS SUMMARY ROW */}
      <div style={styles.statsRow}>
        
        <div className="premium-card" style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, background: "rgba(15, 118, 110, 0.08)", color: "#0f766e" }}>
            <FiLayers size={22} />
          </div>
          <div>
            <div style={styles.statLabel}>Monitored Nodes</div>
            <div style={styles.statVal}>{activeNodesCount} Active / {totalPlants} Total</div>
          </div>
        </div>

        <div className="premium-card" style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}>
            <FiActivity size={22} />
          </div>
          <div>
            <div style={styles.statLabel}>Cumulative Carbon</div>
            <div style={styles.statVal}>{formatCarbonVal(totalFootprint)}</div>
          </div>
        </div>

        <div className="premium-card" style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, background: activeHotspots > 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(16, 185, 129, 0.08)", color: activeHotspots > 0 ? "#f59e0b" : "#10b981" }}>
            <FiAlertCircle size={22} />
          </div>
          <div>
            <div style={styles.statLabel}>Active Hotspots</div>
            <div style={styles.statVal}>{activeHotspots} Alerts</div>
          </div>
        </div>

        <div className="premium-card" style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, background: "rgba(59, 130, 246, 0.08)", color: "#3b82f6" }}>
            <FaChartLine size={20} />
          </div>
          <div>
            <div style={styles.statLabel}>Cumulative Production</div>
            <div style={styles.statVal}>{totalProduction.toLocaleString()} Units</div>
          </div>
        </div>

      </div>

      {/* ACTION BAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginTop: "12px",
        marginBottom: "8px"
      }}>
        {/* Search Input */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          flex: "0 1 360px",
          width: "100%"
        }}>
          <FiSearch style={{
            position: "absolute",
            left: "14px",
            color: "#94a3b8",
            fontSize: "18px"
          }} />
          <input
            type="text"
            placeholder="Search by Plant, State, or City..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: "12px 14px 12px 42px",
              borderRadius: "12px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: "14px",
              fontWeight: "600",
              width: "100%",
              outline: "none",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.02)",
              transition: "all 0.2s"
            }}
            onFocus={e => {
              e.target.style.borderColor = "#10b981";
              e.target.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.1)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "rgba(226, 232, 240, 0.8)";
              e.target.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.02)";
            }}
          />
        </div>

        {/* Add Plant Button */}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(15, 118, 110, 0.2)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        >
          <FiPlus size={18} /> Add Plant
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <p style={{ color: "#64748b", fontWeight: 700 }}>Synchronizing operational logs...</p>
        </div>
      ) : plantsList.length === 0 ? (
        /* EMPTY STATE - NO PLANTS EXIST */
        <div style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "60px 40px",
          textAlign: "center",
          border: "1px dashed rgba(16, 185, 129, 0.3)",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginTop: "12px"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(15, 118, 110, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0f766e"
          }}>
            <FaIndustry size={28} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "18px", fontWeight: "800" }}>
              No plants available yet.
            </h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
              Click Add Plant to create your first plant.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(15, 118, 110, 0.15)",
              marginTop: "8px"
            }}
          >
            Add First Plant
          </button>
        </div>
      ) : filteredPlants.length === 0 ? (
        /* EMPTY STATE - NO PLANTS MATCH FILTER */
        <div style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "60px 40px",
          textAlign: "center",
          border: "1px dashed #cbd5e1",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginTop: "12px"
        }}>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px", fontWeight: "800" }}>
            No plants match your search.
          </h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: "500" }}>
            Try checking the spelling or search for another state or city.
          </p>
        </div>
      ) : (
        /* PLANT GRID */
        <div style={styles.grid}>
          {filteredPlants.map((plant) => {
            const isHigh = plant.hasData && plant.footprintValue > plant.threshold;
            const ratioPercent = plant.hasData 
              ? Math.min(100, Math.round((plant.footprintValue / plant.threshold) * 100))
              : 0;

            return (
              <div
                key={plant.id}
                className="premium-card"
                style={{
                  ...styles.card,
                  borderColor: isHigh ? "rgba(239, 68, 68, 0.3)" : "rgba(226, 232, 240, 0.8)"
                }}
                onClick={() => navigate(`/admin/plant/${plant.name}`)}
              >
                {/* Background Illustration Watermark */}
                <FactoryOutlineSvg />

                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>
                    <FaIndustry size={18} color="#0f766e" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={styles.cardTitle}>{plant.name}</h2>
                    <span style={styles.plantTag}>
                      {plant.city ? `${plant.city}, ` : ''}{plant.state}
                    </span>
                  </div>
                  {/* Last updated timestamp & Delete option */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, zIndex: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: "11px", fontWeight: 700 }}>
                      <FiClock size={12} />
                      <span>{plant.lastUpdated}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlantToDelete({ id: plant.id, name: plant.name });
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                      title="Delete Plant"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={styles.metricsBox}>
                  
                  {/* Metric 1 */}
                  <div style={styles.metricItem}>
                    <p style={styles.metricLabel}>Carbon Threshold Status</p>
                    <div style={{ 
                      ...styles.indicator, 
                      color: !plant.hasData ? "#64748b" : (isHigh ? "#ef4444" : "#10b981")
                    }}>
                      {!plant.hasData ? (
                        <>
                          <FiAlertCircle size={18} />
                          <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "0.5px" }}>
                            AWAITING RECORDS
                          </span>
                        </>
                      ) : isHigh ? (
                        <>
                          <FaExclamationTriangle size={18} />
                          <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "0.5px" }}>
                            THRESHOLD EXCEEDED
                          </span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle size={18} />
                          <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "0.5px" }}>
                            UNDER REGULATORY CAP
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footprint vs Threshold bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4, zIndex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                      <span>Cap Utilization</span>
                      <span>{ratioPercent}%</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{
                        ...styles.progressBarFill,
                        width: `${ratioPercent}%`,
                        background: !plant.hasData 
                          ? "#cbd5e1" 
                          : (isHigh ? "linear-gradient(90deg, #ef4444, #f87171)" : "linear-gradient(90deg, #10b981, #34d399)")
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>
                      <span>{plant.hasData ? `${plant.footprintValue.toLocaleString()} MT` : "0 MT"}</span>
                      <span>Cap: {plant.threshold.toLocaleString()} MT</span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div style={{ ...styles.metricItem, borderTop: "1px dashed #e2e8f0", paddingTop: 14, zIndex: 1 }}>
                    <p style={styles.metricLabel}>Active Production Rate</p>
                    <div style={{ ...styles.indicator, color: "#1e293b" }}>
                      <FaChartLine size={18} color="#3b82f6" />
                      <span style={{ fontWeight: 800, fontSize: "14px" }}>
                        {plant.hasData ? `${plant.production.toLocaleString()} units / month` : "0 units / month"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMBEDDED REPORTS SECTION */}
      <div className="premium-card" style={styles.reportsSection}>
        <AdminReports />
      </div>

      {/* ADD PLANT MODAL */}
      {showAddModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
              Add Manufacturing Plant
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Register a new production node under the enterprise monitoring catalog.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Plant Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Plant"
                  value={newPlantName}
                  onChange={e => setNewPlantName(e.target.value)}
                  disabled={actionLoading}
                  style={styles.modalInput}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>State *</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi"
                  value={newPlantState}
                  onChange={e => setNewPlantState(e.target.value)}
                  disabled={actionLoading}
                  style={styles.modalInput}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>City (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={newPlantCity}
                  onChange={e => setNewPlantCity(e.target.value)}
                  disabled={actionLoading}
                  style={styles.modalInput}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  if (!actionLoading) {
                    setShowAddModal(false);
                    setNewPlantName("");
                    setNewPlantState("");
                    setNewPlantCity("");
                  }
                }}
                disabled={actionLoading}
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPlant}
                disabled={actionLoading}
                style={styles.modalSubmitBtn}
              >
                {actionLoading ? <FiLoader className="spinner" style={{ animation: "spin 1s linear infinite" }} /> : "Add Plant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PLANT MODAL */}
      {plantToDelete && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#ef4444", letterSpacing: "-0.5px" }}>
              Delete "{plantToDelete.name}"?
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
              This will remove the plant from the Admin Overview.<br />
              Historical reports will remain available.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button onClick={() => setPlantToDelete(null)} style={styles.modalCancelBtn}>Cancel</button>
              <button onClick={handleDeletePlant} disabled={actionLoading} style={styles.modalDeleteBtn}>{actionLoading ? <FiLoader className="spinner" /> : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

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
  // Background styles
  bgContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #ecfeff 100%)",
    zIndex: -1,
    overflow: "hidden",
    pointerEvents: "none"
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "radial-gradient(#0f766e 0.6px, transparent 0.6px)",
    backgroundSize: "20px 20px",
    opacity: 0.08
  },
  bubble: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(20px)",
    pointerEvents: "none"
  },
  // Hero Banner styles
  heroBanner: {
    background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
    borderRadius: "24px",
    padding: "36px 48px",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 118, 110, 0.15)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    gap: "24px"
  },
  heroGridBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
    backgroundSize: "16px 16px",
    opacity: 0.8,
    pointerEvents: "none",
    zIndex: 1
  },
  heroTitle: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.5px"
  },
  heroSubtitle: {
    fontSize: "14px",
    color: "#ccfbf1",
    margin: 0,
    fontWeight: 500,
    lineHeight: "1.6",
    maxWidth: "600px",
    marginTop: "8px"
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
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px"
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
    borderRadius: "20px",
    padding: "24px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "14px",
    zIndex: 1
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
    padding: "24px",
    borderRadius: "24px"
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.3)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalContent: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 20px 50px rgba(15, 118, 110, 0.08), 0 0 0 1px rgba(16, 185, 129, 0.1)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    animation: "modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
  },
  modalInput: { padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "14px", width: "100%", boxSizing: "border-box", outline: "none", color: "#0f172a" },
  modalCancelBtn: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#475569",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    transition: "0.2s"
  },
  modalSubmitBtn: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15, 118, 110, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "110px",
    transition: "0.2s"
  },
  modalDeleteBtn: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "90px",
    transition: "0.2s"
  }
};

// Add standard hover animations dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  /* Premium card styling and hover glow lift */
  .premium-card {
    background: #ffffff !important;
    border: 1px solid rgba(226, 232, 240, 0.8) !important;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02) !important;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .premium-card:hover {
    transform: translateY(-6px) !important;
    box-shadow: 0 12px 30px rgba(15, 118, 110, 0.08), 
                0 0 20px rgba(16, 185, 129, 0.15) !important;
    border-color: rgba(16, 185, 129, 0.3) !important;
  }

  /* Animated background bubbles */
  @keyframes floatBubble {
    0% { transform: translateY(0px) rotate(0deg); opacity: 0.12; }
    50% { transform: translateY(-40px) rotate(180deg); opacity: 0.22; }
    100% { transform: translateY(0px) rotate(360deg); opacity: 0.12; }
  }
  .floating-bubble {
    animation: floatBubble 16s ease-in-out infinite;
  }

  /* Rotating wind turbine blades */
  @keyframes spinBlades {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .spin-slow {
    animation: spinBlades 24s linear infinite;
  }
  .spin-slower {
    animation: spinBlades 36s linear infinite;
  }

  /* Globe Node pulses */
  @keyframes pulseNode {
    0% { transform: scale(0.6); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  .node-pulse-1 {
    transform-origin: 50px 15px;
    animation: pulseNode 3s ease-in-out infinite;
  }
  .node-pulse-2 {
    transform-origin: 35px 75px;
    animation: pulseNode 3s ease-in-out infinite;
    animation-delay: 1s;
  }
  .node-pulse-3 {
    transform-origin: 80px 40px;
    animation: pulseNode 3s ease-in-out infinite;
    animation-delay: 2s;
  }

  /* Slide in toast animation */
  @keyframes slideIn {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* Modal scale-up animation */
  @keyframes modalFadeIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .spinner {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
