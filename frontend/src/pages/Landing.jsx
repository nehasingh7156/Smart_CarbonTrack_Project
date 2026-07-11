import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiMapPin, FiLock, FiUser, FiArrowRight, FiActivity, FiEye, FiEyeOff 
} from "react-icons/fi";

export default function Landing() {
  const navigate = useNavigate();
  const [role, setRole] = useState("manager"); // "manager" or "admin"
  
  // Manager State
  const [plant, setPlant] = useState("");
  const [managerPassword, setManagerPassword] = useState("");

  // Admin State
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // UI States
  const [showManagerPassword, setShowManagerPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [plantFocus, setPlantFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [adminFocus, setAdminFocus] = useState(false);
  const [adminPassFocus, setAdminPassFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Subtle mouse movement parallax coordinates
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20;
    const y = (clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleLogin = () => {
    if (role === "manager") {
      if (!plant.trim() || !managerPassword.trim()) {
        alert("Enter Plant ID and Password");
        return;
      }
      if (managerPassword === "password123") {
        localStorage.setItem("userRole", "manager");
        localStorage.setItem("plant", plant);
        navigate("/app/home");
      } else {
        alert("Invalid Password");
      }
    } else {
      if (!adminId.trim() || !adminPassword.trim()) {
        alert("Enter User ID and Password");
        return;
      }
      if (adminId === "admin" && adminPassword === "password123") {
        localStorage.setItem("userRole", "admin");
        navigate("/admin/dashboard");
      } else {
        alert("Invalid Credentials");
      }
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      handleLogin();
      setLoading(false);
    }, 600); // Elegant loading spinner pause
  };

  const floatingBadges = [
    { text: "🌿 Real-Time Carbon Monitoring", x: 8, y: 22, delay: 0 },
    { text: "🤖 AI Emission Forecasting", x: 75, y: 15, delay: 1 },
    { text: "⚡ Energy Optimization", x: 80, y: 78, delay: 3 },
    { text: "🏭 Multi-Plant Monitoring", x: 12, y: 74, delay: 4 }
  ];

  return (
    <div
      onMouseMove={handleMouseMove}
      style={styles.container}
      className="entrance-fade"
    >
      {/* Background Engineering Grid Pattern */}
      <div style={styles.gridOverlay} />

      {/* Expanded Animated SVG Landscape (Wind Turbines, Factory Silhouette, Pulsing IoT node paths) */}
      <div style={{
        ...styles.parallaxWrapper,
        transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`
      }}>
        <svg style={styles.svgBackground} viewBox="0 0 1440 500" fill="none">
          <defs>
            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0"/>
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Clouds */}
          <path d="M120,80 Q145,55 170,80 Q195,80 185,105 H105 Q92,105 120,80 Z" fill="white" opacity="0.4" className="cloud-move-1" />
          <path d="M900,110 Q925,85 950,110 Q975,110 962,135 H882 Q870,135 900,110 Z" fill="white" opacity="0.3" className="cloud-move-2" />

          {/* Factory Silhouette */}
          <path d="M1100 500 V380 H1140 V405 H1165 V365 H1215 V405 H1250 V350 H1290 L1315 375 H1360 V500 Z" fill="#a7f3d0" opacity="0.22" />
          <path d="M1175 365 V300 H1188 V365 Z" fill="#a7f3d0" opacity="0.25" />
          
          {/* Solar Panel Array */}
          <polygon points="760,420 860,420 830,460 730,460" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" />
          <line x1="760" y1="420" x2="730" y2="460" stroke="rgba(16, 185, 129, 0.2)" />
          <line x1="793" y1="420" x2="763" y2="460" stroke="rgba(16, 185, 129, 0.2)" />
          <line x1="826" y1="420" x2="796" y2="460" stroke="rgba(16, 185, 129, 0.2)" />
          <line x1="860" y1="420" x2="830" y2="460" stroke="rgba(16, 185, 129, 0.2)" />
          {/* Solar Shimmer Effect */}
          <polygon points="760,420 860,420 830,460 730,460" fill="url(#shimmerGrad)" className="solar-shimmer" />

          {/* Wind Turbine 1 (Left-Mid) */}
          <g transform="translate(160, 280)">
            <polygon points="-6,180 6,180 0,0" fill="rgba(16, 185, 129, 0.22)" />
            <circle cx="0" cy="0" r="4.5" fill="rgba(16, 185, 129, 0.6)" />
            <g className="spin-blades">
              <line x1="0" y1="0" x2="0" y2="-75" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="0" x2="64.9" y2="37.5" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="0" x2="-64.9" y2="37.5" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>

          {/* Wind Turbine 2 (Far-Left) */}
          <g transform="translate(340, 310)">
            <polygon points="-5,160 5,160 0,0" fill="rgba(16, 185, 129, 0.16)" />
            <circle cx="0" cy="0" r="4" fill="rgba(16, 185, 129, 0.5)" />
            <g className="spin-blades-slow">
              <line x1="0" y1="0" x2="0" y2="-60" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="52" y2="30" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="-52" y2="30" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </g>

          {/* Wind Turbine 3 (Mid-Right) */}
          <g transform="translate(620, 290)">
            <polygon points="-5,170 5,170 0,0" fill="rgba(16, 185, 129, 0.18)" />
            <circle cx="0" cy="0" r="4" fill="rgba(16, 185, 129, 0.5)" />
            <g className="spin-blades-mid">
              <line x1="0" y1="0" x2="0" y2="-65" stroke="rgba(16, 185, 129, 0.32)" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="56.3" y2="32.5" stroke="rgba(16, 185, 129, 0.32)" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="0" y1="0" x2="-56.3" y2="32.5" stroke="rgba(16, 185, 129, 0.32)" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </g>

          {/* Network IoT Streams */}
          <path d="M160,280 L340,310 L500,240 L620,290 L790,430 L1100,380" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1.5" strokeDasharray="6,6" />
          <circle cx="160" cy="280" r="5" fill="#10b981" className="node-pulse" />
          <circle cx="340" cy="310" r="5" fill="#0f766e" className="node-pulse" />
          <circle cx="500" cy="240" r="5" fill="#10b981" className="node-pulse" />
          <circle cx="620" cy="290" r="5" fill="#0f766e" className="node-pulse" />
          <circle cx="790" cy="430" r="5" fill="#10b981" className="node-pulse" />
        </svg>
      </div>

      {/* Floating Decorative Capability Badges */}
      {floatingBadges.map((badge, i) => (
        <div
          key={i}
          className="floating-badge-item"
          style={{
            ...styles.floatingCardStyle,
            left: `${badge.x}%`,
            top: `${badge.y}%`,
            animationDelay: `${badge.delay}s`,
            transform: `translate(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px)`
          }}
        >
          {badge.text}
        </div>
      ))}

      {/* Main Dual Column Layout Wrapper */}
      <div style={styles.layoutWrapper}>
        
        {/* Left Column: SmartCarbonTrack branding logo & Spacious details */}
        <div style={styles.leftCol} className="entrance-slide">
          <div style={styles.brandHeader}>
            <FiActivity style={{ fontSize: "36px", color: "#10b981", strokeWidth: 3 }} />
            <h1 style={styles.brandLogo}>
              Smart<span style={{ color: "#10b981" }}>CarbonTrack</span>
            </h1>
          </div>
          
          <p style={styles.brandTagline}>
            Industrial Carbon Intelligence Portal
          </p>
        </div>

        {/* Right Column: Premium Auth Glass Box */}
        <div style={styles.rightCol} className="entrance-slide" style={{ animationDelay: "0.15s" }}>
          
          <div style={styles.authContainer} className="auth-box-glow">
            
            {/* Header info */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={styles.authTitle}>Security Portal Access</h3>
              <p style={styles.authSubtitle}>Select role credentials to synchronize dashboard</p>
            </div>

            {/* Premium Segmented Toggle control */}
            <div style={styles.roleToggleWrapper}>
              <div style={{
                ...styles.roleToggleBg,
                left: role === "manager" ? "4px" : "calc(50% + 2px)"
              }} />
              
              <button
                type="button"
                onClick={() => setRole("manager")}
                style={{
                  ...styles.roleToggleBtn,
                  color: role === "manager" ? "#ffffff" : "#475569"
                }}
              >
                Plant Manager
              </button>
              
              <button
                type="button"
                onClick={() => setRole("admin")}
                style={{
                  ...styles.roleToggleBtn,
                  color: role === "admin" ? "#ffffff" : "#475569"
                }}
              >
                Admin Portal
              </button>
            </div>

            {/* Inputs Box form */}
            <form onSubmit={handleLoginClick} style={styles.inputBox}>
              {role === "manager" ? (
                <>
                  {/* Plant ID input */}
                  <div style={styles.inputFieldWrapper}>
                    <FiMapPin style={{
                      ...styles.inputFieldIcon,
                      color: plantFocus ? "#10b981" : "#94a3b8"
                    }} />
                    <input
                      type="text"
                      placeholder="Plant ID (e.g., Bhopal)"
                      value={plant}
                      onChange={(e) => setPlant(e.target.value)}
                      onFocus={() => setPlantFocus(true)}
                      onBlur={() => setPlantFocus(false)}
                      style={{
                        ...styles.input,
                        borderColor: plantFocus ? "#10b981" : "rgba(226, 232, 240, 0.8)",
                        boxShadow: plantFocus ? "0 0 12px rgba(16, 185, 129, 0.15)" : "none"
                      }}
                    />
                  </div>
                  
                  {/* Password Input */}
                  <div style={styles.inputFieldWrapper}>
                    <FiLock style={{
                      ...styles.inputFieldIcon,
                      color: passFocus ? "#10b981" : "#94a3b8"
                    }} />
                    <input
                      type={showManagerPassword ? "text" : "password"}
                      placeholder="Security Password"
                      value={managerPassword}
                      onChange={(e) => setManagerPassword(e.target.value)}
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      style={{
                        ...styles.input,
                        borderColor: passFocus ? "#10b981" : "rgba(226, 232, 240, 0.8)",
                        boxShadow: passFocus ? "0 0 12px rgba(16, 185, 129, 0.15)" : "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowManagerPassword(prev => !prev)}
                      style={styles.eyeButton}
                      aria-label={showManagerPassword ? "Hide password" : "Show password"}
                    >
                      {showManagerPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Admin User ID input */}
                  <div style={styles.inputFieldWrapper}>
                    <FiUser style={{
                      ...styles.inputFieldIcon,
                      color: adminFocus ? "#10b981" : "#94a3b8"
                    }} />
                    <input
                      type="text"
                      placeholder="Admin User ID"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      onFocus={() => setAdminFocus(true)}
                      onBlur={() => setAdminFocus(false)}
                      style={{
                        ...styles.input,
                        borderColor: adminFocus ? "#10b981" : "rgba(226, 232, 240, 0.8)",
                        boxShadow: adminFocus ? "0 0 12px rgba(16, 185, 129, 0.15)" : "none"
                      }}
                    />
                  </div>
                  
                  {/* Admin Password Input */}
                  <div style={styles.inputFieldWrapper}>
                    <FiLock style={{
                      ...styles.inputFieldIcon,
                      color: adminPassFocus ? "#10b981" : "#94a3b8"
                    }} />
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onFocus={() => setAdminPassFocus(true)}
                      onBlur={() => setAdminPassFocus(false)}
                      style={{
                        ...styles.input,
                        borderColor: adminPassFocus ? "#10b981" : "rgba(226, 232, 240, 0.8)",
                        boxShadow: adminPassFocus ? "0 0 12px rgba(16, 185, 129, 0.15)" : "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(prev => !prev)}
                      style={styles.eyeButton}
                      aria-label={showAdminPassword ? "Hide password" : "Show password"}
                    >
                      {showAdminPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </>
              )}

              {/* Login Button with loading transition */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.85 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    Sign In to Dashboard
                    <FiArrowRight />
                  </div>
                )}
              </button>
            </form>

          </div>
        </div>

      </div>

      {/* Failsafe clean animations injected */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drift {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes spin-blades-kf {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-node-kf {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.85; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes cloud-move-1-kf {
          0% { transform: translateX(0); }
          100% { transform: translateX(80px); }
        }
        @keyframes cloud-move-2-kf {
          0% { transform: translateX(0); }
          100% { transform: translateX(-80px); }
        }
        @keyframes shimmer-anim-kf {
          0% { transform: translateX(-150px) translateY(-50px) rotate(30deg); }
          100% { transform: translateX(150px) translateY(50px) rotate(30deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .entrance-fade {
          animation: fadeIn 1.2s ease-out forwards;
        }
        .entrance-slide {
          animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .floating-badge-item {
          animation: drift 6s ease-in-out infinite alternate;
        }
        .spin-blades {
          transform-origin: 0 0;
          animation: spin-blades-kf 14s linear infinite;
        }
        .spin-blades-mid {
          transform-origin: 0 0;
          animation: spin-blades-kf 17s linear infinite;
        }
        .spin-blades-slow {
          transform-origin: 0 0;
          animation: spin-blades-kf 22s linear infinite;
        }
        .node-pulse {
          transform-origin: center;
          animation: pulse-node-kf 2s ease-in-out infinite;
        }
        .cloud-move-1 {
          animation: cloud-move-1-kf 25s ease-in-out infinite alternate;
        }
        .cloud-move-2 {
          animation: cloud-move-2-kf 35s ease-in-out infinite alternate;
        }
        .solar-shimmer {
          animation: shimmer-anim-kf 4s linear infinite;
        }
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
        }
        .auth-box-glow:hover {
          box-shadow: 0 20px 40px rgba(15, 118, 110, 0.06), 0 0 0 1px rgba(16, 185, 129, 0.25) !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f8fafc 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif"
  },

  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: "40px 40px",
    backgroundImage: "linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px)",
    pointerEvents: "none",
    zIndex: 1
  },

  parallaxWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    pointerEvents: "none",
    zIndex: 2,
    display: "flex",
    alignItems: "flex-end"
  },

  svgBackground: {
    width: "100%",
    height: "55vh",
    maxHeight: "550px"
  },

  floatingCardStyle: {
    position: "absolute",
    padding: "10px 16px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(16, 185, 129, 0.15)",
    borderRadius: "14px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#0f766e",
    boxShadow: "0 4px 16px rgba(15, 118, 110, 0.04)",
    zIndex: 2,
    pointerEvents: "none",
    transition: "transform 0.15s ease-out"
  },

  layoutWrapper: {
    display: "flex",
    maxWidth: "1200px",
    width: "100%",
    padding: "0 40px",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    gap: "64px",
    flexWrap: "wrap"
  },

  leftCol: {
    flex: "1 1 450px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  brandHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  brandLogo: {
    fontSize: "32px",
    fontWeight: 900,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-1px"
  },

  brandTagline: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f766e",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "1px"
  },

  rightCol: {
    flex: "0 1 420px",
    width: "100%"
  },

  authContainer: {
    display: "flex",
    flexDirection: "column",
    background: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    padding: "36px 40px",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(15, 118, 110, 0.04), 0 0 0 1px rgba(16, 185, 129, 0.12)",
    boxSizing: "border-box",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
  },

  authTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px"
  },

  authSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "6px 0 0 0"
  },

  roleToggleWrapper: {
    display: "flex",
    background: "rgba(15, 118, 110, 0.05)",
    border: "1px solid rgba(16, 185, 129, 0.1)",
    borderRadius: "14px",
    padding: "4px",
    position: "relative",
    marginBottom: "24px",
    overflow: "hidden"
  },

  roleToggleBg: {
    position: "absolute",
    top: "4px",
    bottom: "4px",
    width: "calc(50% - 6px)",
    background: "#10b981",
    borderRadius: "10px",
    transition: "left 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    zIndex: 1,
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)"
  },

  roleToggleBtn: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "transparent",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    position: "relative",
    zIndex: 2,
    transition: "color 0.25s",
    outline: "none"
  },

  inputBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  inputFieldWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },

  inputFieldIcon: {
    position: "absolute",
    left: "16px",
    fontSize: "18px",
    transition: "color 0.2s",
    pointerEvents: "none"
  },

  input: {
    padding: "15px 44px 15px 44px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "14px",
    border: "1.5px solid rgba(226, 232, 240, 0.8)",
    fontSize: "14px",
    background: "#ffffff",
    color: "#0f172a",
    outline: "none",
    fontWeight: "600",
    transition: "all 0.25s ease-out"
  },

  eyeButton: {
    position: "absolute",
    right: "16px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    color: "#94a3b8",
    fontSize: "18px",
    outline: "none",
    zIndex: 10
  },

  button: {
    padding: "15px 22px",
    fontSize: "15px",
    fontWeight: 800,
    color: "#ffffff",
    background: "linear-gradient(135deg, #10b981 0%, #0f766e 100%)",
    border: "none",
    borderRadius: "14px",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.25)",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    marginTop: "8px",
    outline: "none"
  }
};
