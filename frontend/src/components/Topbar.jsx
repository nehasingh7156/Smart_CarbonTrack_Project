import { useNavigate } from "react-router-dom";
import { FiMenu, FiLogOut } from "react-icons/fi";

export default function Topbar({ plant, page, setCollapsed }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "manager";

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("plant");
    navigate("/");
  };

  return (
    <div
      className="no-print"
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 40,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Toggle Collapse Button */}
        {setCollapsed && (
          <button
            onClick={() => setCollapsed(prev => !prev)}
            style={{
              background: "rgba(15, 118, 110, 0.06)",
              border: "1px solid rgba(15, 118, 110, 0.1)",
              color: "#0f766e",
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "18px",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(15, 118, 110, 0.12)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(15, 118, 110, 0.06)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FiMenu />
          </button>
        )}

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{plant}</h2>
            <span style={{
              background: "rgba(16, 185, 129, 0.1)",
              color: "#047857",
              fontSize: "10px",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span className="online-beacon" style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block"
              }} />
              Platform Connected
            </span>
          </div>
          <p
            style={{
              margin: "2px 0 0 0",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              textTransform: "capitalize",
              letterSpacing: "0.5px"
            }}
          >
            {userRole === "admin" ? "Admin Portal" : "Manager Portal"} / {page}
          </p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: "#0f172a",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1e293b";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(15, 23, 42, 0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#0f172a";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.15)";
        }}
      >
        <FiLogOut />
        Logout
      </button>

      {/* Embedded style tag for beacon animations */}
      <style>{`
        @keyframes beacon-pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        .online-beacon {
          animation: beacon-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
