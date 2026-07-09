import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiEdit,
  FiLayers,
  FiTrendingUp,
  FiFileText,
  FiSettings,
  FiActivity
} from "react-icons/fi";

const links = [
  { path: "home", label: "Home", icon: <FiHome /> },
  { path: "data-entry", label: "Data Entry", icon: <FiEdit /> },
  { path: "dashboard", label: "Dashboard", icon: <FiLayers /> },
  { path: "analytics", label: "Analytics", icon: <FiTrendingUp /> },
  { path: "forecasting", label: "AI Forecasting", icon: <FiActivity /> },
  { path: "reports", label: "Reports", icon: <FiFileText /> },
  { path: "settings", label: "Settings", icon: <FiSettings /> }
];

export default function Sidebar({ collapsed }) {
  return (
    <div
      className="no-print"
      style={{
        width: collapsed ? "80px" : "260px",
        flexShrink: 0,
        background: "linear-gradient(180deg, #094a43 0%, #0f766e 100%)",
        borderRight: "1px solid rgba(16, 185, 129, 0.12)",
        color: "#ffffff",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        boxSizing: "border-box",
        transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 50,
        position: "relative",
        boxShadow: "4px 0 24px rgba(15, 118, 110, 0.05)"
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          marginBottom: "32px", 
          paddingLeft: collapsed ? "0" : "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: collapsed ? "center" : "flex-start",
          transition: "all 0.3s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiActivity style={{ fontSize: "22px", color: "#34d399", strokeWidth: 3 }} />
          {!collapsed && (
            <h1 style={{ 
              margin: 0, 
              fontSize: "19px", 
              fontWeight: 900, 
              letterSpacing: "-0.5px",
              color: "#ffffff"
            }}>
              Smart<span style={{ color: "#34d399" }}>Carbon</span>
            </h1>
          )}
        </div>
        {!collapsed && (
          <p style={{ 
            margin: 0, 
            marginTop: "6px", 
            fontSize: "10px", 
            fontWeight: 800, 
            color: "rgba(255, 255, 255, 0.6)",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            Carbon Intelligence Portal
          </p>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {links.map(link => (
          <NavLink
            key={link.path}
            to={`/app/${link.path}`}
            className="sidebar-navlink"
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "14px",
              padding: "12px 16px",
              borderRadius: "12px",
              textDecoration: "none",
              color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
              fontSize: "14px",
              fontWeight: isActive ? 700 : 600,
              background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
              border: isActive ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative",
              overflow: "hidden"
            })}
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Pillar */}
                {isActive && !collapsed && (
                  <span style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: "4px",
                    background: "#34d399",
                    borderRadius: "0 4px 4px 0"
                  }} />
                )}

                <span style={{ 
                  fontSize: "18px", 
                  color: isActive ? "#34d399" : "rgba(255, 255, 255, 0.75)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.25s"
                }}>
                  {link.icon}
                </span>

                {!collapsed && (
                  <span style={{ transition: "opacity 0.2s", opacity: 1 }}>
                    {link.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Inject hover animations */}
      <style>{`
        .sidebar-navlink:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          transform: translateX(${collapsed ? '0' : '4px'});
        }
        .sidebar-navlink:hover span {
          color: #34d399 !important;
        }
      `}</style>
    </div>
  );
}
