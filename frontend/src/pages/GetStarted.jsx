import { useEffect, useState, useRef } from "react";
import { 
  FiSun, FiWind, FiSettings, FiActivity, FiTarget, FiZap, 
  FiAlertTriangle, FiCheckSquare, FiCpu, FiTrendingUp, 
  FiChevronDown, FiGlobe, FiDatabase, FiLayers, FiFileText, 
  FiShare2, FiShield, FiClock, FiGrid, FiArrowRight 
} from "react-icons/fi";
import "./GetStarted.css";

// --- CountUp Helper Component ---
const CountUp = ({ end, suffix = "", prefix = "", duration = 1500, trigger }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end); // Ensure exact final value
      }
    };
    window.requestAnimationFrame(step);
  }, [trigger, end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export default function GetStarted() {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [productionLoad, setProductionLoad] = useState(100);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (activeSectionIndex === 0) {
        const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        setMousePos({ x, y });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [activeSectionIndex]);
  
  // Compliance checklist interactive state
  const [checklist, setChecklist] = useState([
    { id: 1, label: "Scope 1 & Scope 2 Emission Isolation", desc: "Automated separation of fuel logs and grid power inputs.", checked: true },
    { id: 2, label: "BRSR / SEBI Compliance Mapping", desc: "Formats data directly into standard compliance templates.", checked: true },
    { id: 3, label: "Verifiable Audit Trail Logs", desc: "Encrypts historical entries for third-party audit readiness.", checked: false },
    { id: 4, label: "Real-Time Greenhouse Gas (GHG) Protocol Alignment", desc: "Calculations based on updated carbon coefficient standards.", checked: true },
    { id: 5, label: "Automatic PDF/Excel ESG Report Compiler", desc: "Generates executive summaries in one click.", checked: false },
  ]);

  const toggleChecklist = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Section references for observer
  const refHero = useRef(null);
  const refAbout = useRef(null);
  const refChallenges = useRef(null);
  const refWorks = useRef(null);
  const refFeatures = useRef(null);
  const refKpis = useRef(null);
  const refDashboard = useRef(null);
  const refAi = useRef(null);
  const refCompliance = useRef(null);
  const refImpact = useRef(null);
  const refFinal = useRef(null);

  // Set up IntersectionObserver
  useEffect(() => {
    const refsArray = [
      refHero, refAbout, refChallenges, refWorks, refFeatures,
      refKpis, refDashboard, refAi, refCompliance, refImpact, refFinal
    ];
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -25% 0px", // Trigger when section hits middle portion of screen
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-section-index"), 10);
          setActiveSectionIndex(index);
          entry.target.classList.add("in-view");
        }
      });
    }, observerOptions);

    refsArray.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToNext = (index) => {
    const refsArray = [
      refHero, refAbout, refChallenges, refWorks, refFeatures,
      refKpis, refDashboard, refAi, refCompliance, refImpact, refFinal
    ];
    if (refsArray[index] && refsArray[index].current) {
      refsArray[index].current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // AI Calculations based on Interactive Slider
  const simulatedEmissions = Math.round(productionLoad * 2.85);
  const simulatedAnomalyRisk = productionLoad > 120 ? "HIGH" : productionLoad > 90 ? "NORMAL" : "LOW";
  const simulatedCredits = Math.round(Math.max(0, 480 - productionLoad * 2.5));
  const simulatedSavings = Math.round(Math.max(0, 18.5 - (productionLoad - 100) * 0.1) * 10) / 10;

  return (
    <div className="get-started-wrapper">
      
      <header className="floating-header glass-panel" style={{ justifyContent: "center" }}>
        <a href="/" className="header-logo" onClick={(e) => { e.preventDefault(); scrollToNext(0); }}>
          <FiActivity className="header-logo-icon" style={{ strokeWidth: 3 }} />
          <span>
            <span style={{ color: "#0f172a", fontWeight: 800 }}>Smart</span>
            <span style={{ color: "#10b981", fontWeight: 800 }}>CarbonTrack</span>
          </span>
        </a>
      </header>

      {/* --- EVOLVING BACKGROUND --- */}
      <div className={`evolving-bg-container bg-stage-${activeSectionIndex}`}>
        <div className="bg-gradient-overlay" />
        
        {/* Style Tag for self-contained premium SVG animations */}
        <style>{`
          @keyframes turbine-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-turbine-spin {
            animation: turbine-spin 12s linear infinite;
          }
          @keyframes cloud-drift {
            0% { transform: translateX(-150px); }
            100% { transform: translateX(1200px); }
          }
          .animate-cloud-drift-slow {
            animation: cloud-drift 100s linear infinite;
          }
          .animate-cloud-drift-fast {
            animation: cloud-drift 60s linear infinite;
          }
          @keyframes smoke-puff-rise {
            0% { transform: translateY(0) scale(0.6); opacity: 0; }
            10% { opacity: 0.7; }
            90% { opacity: 0; }
            100% { transform: translateY(-70px) scale(1.5); opacity: 0; }
          }
          .smoke-1 { animation: smoke-puff-rise 5s ease-out infinite; transform-origin: bottom center; }
          .smoke-2 { animation: smoke-puff-rise 7s ease-out infinite; animation-delay: 2.2s; transform-origin: bottom center; }
          .smoke-3 { animation: smoke-puff-rise 6s ease-out infinite; animation-delay: 4.4s; transform-origin: bottom center; }
          
          @keyframes solar-glint {
            0% { transform: translateX(-200px) translateY(-200px) rotate(45deg); }
            100% { transform: translateX(300px) translateY(300px) rotate(45deg); }
          }
          .shimmer-mask {
            animation: solar-glint 5s ease-in-out infinite;
          }
          @keyframes sensor-beacon {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.8); opacity: 0.8; }
            100% { transform: scale(1); opacity: 0.3; }
          }
          .sensor-pulse-circle {
            animation: sensor-beacon 3s ease-in-out infinite;
            transform-origin: center;
          }
          @keyframes flow-dots {
            to { stroke-dashoffset: -30px; }
          }
          .flow-line-dashed {
            animation: flow-dots 1.5s linear infinite;
          }
        `}</style>

        {/* Particle System Layer */}
        <div className="background-graphics-canvas">
          <div className="glowing-particle float-slow" style={{ left: "15%", animationDelay: "0s", transform: "scale(1.5)" }} />
          <div className="glowing-particle float-slow" style={{ left: "45%", animationDelay: "2s", transform: "scale(0.8)" }} />
          <div className="glowing-particle float-slow" style={{ left: "75%", animationDelay: "4s", transform: "scale(1.2)" }} />
          <div className="glowing-particle float-slow" style={{ left: "30%", animationDelay: "6s", transform: "scale(1.8)" }} />
          <div className="glowing-particle float-slow" style={{ left: "85%", animationDelay: "8s", transform: "scale(0.5)" }} />
        </div>

        {/* Dynamic Vector Layers (Morphing on Scroll index) */}
        <div className="background-graphics-canvas">
          
          {/* Layer 0: Premium Interactive Industrial Landscape Parallax (Visible ONLY in Section 1 / index 0) */}
          <div className="bg-svg-layer active" style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            opacity: activeSectionIndex === 0 ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 1s ease-in-out, transform 0.2s ease-out",
            transform: "scale(1.02)"
          }}>
            {/* Background Layer (Sun Glow & Clouds) - Slow Parallax */}
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transition: "transform 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)",
              transform: `translate(${mousePos.x * -6}px, ${mousePos.y * -6}px)`
            }}>
              <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" fill="none">
                <radialGradient id="sunGlowGrad" cx="75%" cy="35%" r="75%">
                  <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#ecfdf5" stopOpacity="0.3" />
                  <stop offset="85%" stopColor="#f8fafc" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" /> {/* Rich navy contrast blend */}
                </radialGradient>
                <rect width="100%" height="100%" fill="url(#sunGlowGrad)" />
                
                {/* Cloud 1 */}
                <g className="animate-cloud-drift-slow" style={{ transformOrigin: "0px 0px" }}>
                  <path d="M 0 80 Q 25 60 50 60 Q 75 60 85 80 Z" fill="rgba(255,255,255,0.7)" />
                  <path d="M 35 80 Q 55 50 85 50 Q 115 50 125 80 Z" fill="rgba(255,255,255,0.85)" />
                </g>
                {/* Cloud 2 */}
                <g className="animate-cloud-drift-fast" style={{ transformOrigin: "0px 0px" }}>
                  <path d="M 0 150 Q 30 135 60 135 Q 90 135 100 150 Z" fill="rgba(255,255,255,0.6)" />
                </g>
              </svg>
            </div>

            {/* Midground Layer (Factory structures, hills, forests, glows, rays) - Medium Parallax */}
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transition: "transform 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)",
              transform: `translate(${mousePos.x * -16}px, ${mousePos.y * -16}px)`
            }}>
              <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" fill="none">
                <defs>
                  <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feComponentTransfer in="blur" result="glow">
                      <feFuncA type="linear" slope="0.75"/>
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="lightRayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Ambient Light Rays */}
                <polygon points="900,100 1200,600 1000,600 800,100" fill="url(#lightRayGrad)" opacity="0.06" />
                <polygon points="1000,100 1200,450 1100,550 900,100" fill="url(#lightRayGrad)" opacity="0.04" />

                {/* Soft Hills */}
                <path d="M -50 560 Q 300 490 600 530 T 1250 510 L 1250 650 L -50 650 Z" fill="#e6f4ea" opacity="0.8" />
                <path d="M -50 585 Q 200 530 500 570 T 1250 550 L 1250 650 L -50 650 Z" fill="#dcfce7" opacity="0.6" />
                
                {/* Clean Factory Outlines with Soft Green Glow */}
                <g stroke="#a7f3d0" strokeWidth="1.5" opacity="0.95" filter="url(#greenGlow)">
                  {/* Boiler stacks */}
                  <rect x="520" y="320" width="16" height="200" rx="3" fill="#ffffff" />
                  <rect x="545" y="300" width="18" height="220" rx="3" fill="#ffffff" />
                  <line x1="520" y1="360" x2="536" y2="360" />
                  <line x1="545" y1="350" x2="563" y2="350" />
                  <line x1="520" y1="410" x2="536" y2="410" />
                  <line x1="545" y1="400" x2="563" y2="400" />
                  
                  {/* Smoke Puffs (CO2 morphing circles) */}
                  <circle cx="528" cy="290" r="6" className="smoke-1" fill="rgba(16,185,129,0.12)" stroke="none" />
                  <circle cx="528" cy="290" r="10" className="smoke-2" fill="rgba(16,185,129,0.08)" stroke="none" />
                  <circle cx="554" cy="270" r="8" className="smoke-3" fill="rgba(16,185,129,0.1)" stroke="none" />

                  {/* Main Industrial Plant Building */}
                  <rect x="575" y="370" width="180" height="150" rx="8" fill="#ffffff" />
                  {/* Windows / Grids */}
                  <rect x="595" y="390" width="30" height="30" rx="4" fill="#ecfdf4" />
                  <rect x="635" y="390" width="30" height="30" rx="4" fill="#ecfdf4" />
                  <rect x="675" y="390" width="30" height="30" rx="4" fill="#ecfdf4" />
                  <rect x="595" y="440" width="30" height="30" rx="4" fill="#ecfdf4" />
                  <rect x="635" y="440" width="30" height="30" rx="4" fill="#ecfdf4" />
                  <rect x="675" y="440" width="30" height="30" rx="4" fill="#ecfdf4" />
                  
                  {/* Pipe Connection */}
                  <path d="M 563 450 L 575 450" strokeWidth="3" />
                  <path d="M 755 460 L 785 460 L 785 480 M 785 480 L 805 480" strokeWidth="2.5" />
                  <rect x="805" y="440" width="80" height="80" rx="6" fill="#ffffff" />
                  <circle cx="845" cy="480" r="15" fill="#f0fdf4" />
                  
                  {/* Trusses / Structural details */}
                  <line x1="665" y1="370" x2="665" y2="330" />
                  <line x1="665" y1="330" x2="720" y2="370" />
                  <line x1="720" y1="370" x2="720" y2="330" />
                </g>

                {/* Pine Trees / Greenery */}
                <g fill="#10b981" opacity="0.6">
                  <polygon points="460,530 480,530 470,500" />
                  <polygon points="455,535 485,535 470,505" />
                  <polygon points="900,550 920,550 910,520" />
                  <polygon points="925,560 945,560 935,530" />
                </g>
              </svg>
            </div>

            {/* Foreground Layer (Wind turbines, Solar arrays, Data flows, Sensor nodes) - Fast Parallax */}
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transition: "transform 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)",
              transform: `translate(${mousePos.x * -26}px, ${mousePos.y * -26}px)`
            }}>
              <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" fill="none">
                
                {/* Solar Arrays */}
                <g transform="translate(680, 480)">
                  <polygon points="0,40 60,10 120,25 60,60" fill="url(#solarPanelGrad)" stroke="#34d399" strokeWidth="1.5" />
                  <line x1="30" y1="33" x2="90" y2="18" stroke="#ffffff" strokeWidth="0.8" />
                  <line x1="15" y1="41" x2="75" y2="26" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="45" y1="26" x2="105" y2="11" stroke="#ffffff" strokeWidth="0.8" />
                  <line x1="30" y1="25" x2="30" y2="48" stroke="#ffffff" strokeWidth="0.8" />
                  <line x1="60" y1="18" x2="60" y2="42" stroke="#ffffff" strokeWidth="0.8" />
                  <line x1="90" y1="11" x2="90" y2="34" stroke="#ffffff" strokeWidth="0.8" />
                  
                  {/* Shimmer glaze overlay */}
                  <g clipPath="url(#solarClip)">
                    <line x1="-50" y1="0" x2="150" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="8" className="shimmer-mask" />
                  </g>
                </g>
                
                <defs>
                  <linearGradient id="solarPanelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f766e" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <clipPath id="solarClip">
                    <polygon points="680,520 740,490 800,505 740,540" />
                  </clipPath>
                </defs>

                {/* Wind Turbine 1 (Tall, x=920, y=320) */}
                <g transform="translate(920, 320)">
                  <line x1="0" y1="220" x2="0" y2="0" stroke="#0f766e" strokeWidth="3" opacity="0.8" />
                  <line x1="-5" y1="220" x2="5" y2="220" stroke="#0f766e" strokeWidth="4" />
                  
                  {/* Rotator Hub & Blades */}
                  <g className="animate-turbine-spin" style={{ transformOrigin: "0px 0px" }}>
                    <circle cx="0" cy="0" r="3.5" fill="#10b981" />
                    <line x1="0" y1="0" x2="0" y2="-55" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="47.6" y2="27.5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="-47.6" y2="27.5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                </g>

                {/* Wind Turbine 2 (Shorter, x=1050, y=360) */}
                <g transform="translate(1050, 360)">
                  <line x1="0" y1="180" x2="0" y2="0" stroke="#0f766e" strokeWidth="2" opacity="0.6" />
                  
                  {/* Rotator Hub & Blades */}
                  <g className="animate-turbine-spin" style={{ transformOrigin: "0px 0px", animationDuration: "14s" }}>
                    <circle cx="0" cy="0" r="2.5" fill="#34d399" />
                    <line x1="0" y1="0" x2="0" y2="-45" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="38.9" y2="22.5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="-38.9" y2="22.5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </g>

                {/* IoT Pulsing Sensor Nodes */}
                {/* Node 1: Chimney 1 Top */}
                <circle cx="528" cy="320" r="5" fill="#10b981" />
                <circle cx="528" cy="320" r="10" fill="none" stroke="#10b981" strokeWidth="1.5" className="sensor-pulse-circle" style={{ transformOrigin: "528px 320px" }} />
                
                {/* Node 2: Solar Panel center */}
                <circle cx="740" cy="510" r="5" fill="#10b981" />
                <circle cx="740" cy="510" r="12" fill="none" stroke="#10b981" strokeWidth="1.5" className="sensor-pulse-circle" style={{ transformOrigin: "740px 510px" }} />
                
                {/* Node 3: Turbine 1 Nacelle */}
                <circle cx="920" cy="320" r="5" fill="#10b981" />
                <circle cx="920" cy="320" r="10" fill="none" stroke="#10b981" strokeWidth="1.5" className="sensor-pulse-circle" style={{ transformOrigin: "920px 320px" }} />

                {/* Node 4: Factory Core */}
                <circle cx="665" cy="420" r="6" fill="#0f766e" />
                <circle cx="665" cy="420" r="14" fill="none" stroke="#0f766e" strokeWidth="1.5" className="sensor-pulse-circle" style={{ transformOrigin: "665px 420px" }} />

                {/* Flowing Data Connections (IoT Streams) */}
                {/* Connection 1: Factory to Turbine */}
                <path d="M 665 420 Q 800 350 920 320" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 6" className="flow-line-dashed" />
                {/* Connection 2: Factory to Solar Panel */}
                <path d="M 665 420 Q 700 480 740 510" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 6" className="flow-line-dashed" />
                {/* Connection 3: Chimney to Factory Core */}
                <path d="M 528 320 Q 600 370 665 420" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 6" className="flow-line-dashed" />

              </svg>
            </div>

            {/* Readability mask overlay (Slightly opaque, green-tinted white gradient on left) */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(to right, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 35%, rgba(255, 255, 255, 0.8) 55%, rgba(255, 255, 255, 0.25) 100%)",
              zIndex: 5
            }} />
          </div>

          {/* Layer 1: Earth (Visible in Sections 9, 10, 11 / indices 8, 9, 10) */}
          <svg className={`bg-svg-layer spin-slow ${[8, 9, 10].includes(activeSectionIndex) ? "active" : ""}`} 
               viewBox="0 0 100 100" style={{ right: "5%", bottom: "10%", width: "45%" }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.7" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="0.5" strokeDasharray="5 5" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="0.6" />
            <path d="M 25 50 Q 35 25 50 25 T 75 50 T 50 75 Z" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="0.5" />
            <path d="M 15 50 Q 30 15 50 15 T 85 50" fill="none" stroke="rgba(16, 185, 129, 0.06)" strokeWidth="0.4" />
          </svg>

          {/* Layer 2: Traditional Industry & Smokestacks (Visible in Sections 2, 3) */}
          <svg className={`bg-svg-layer ${[1, 2].includes(activeSectionIndex) ? "active" : ""}`}
               viewBox="0 0 100 100" style={{ left: "10%", bottom: "5%", width: "40%" }}>
            {/* Factory Base Outline */}
            <path d="M 10 90 L 10 60 L 30 70 L 30 50 L 50 65 L 50 40 L 70 55 L 70 90 Z" fill="none" stroke="rgba(71, 85, 105, 0.15)" strokeWidth="0.8" />
            {/* Smoke Outlines */}
            <circle cx="50" cy="30" r="4" className="float-slow" fill="none" stroke="rgba(239, 68, 68, 0.08)" strokeWidth="0.5" />
            <circle cx="52" cy="22" r="6" className="float-slow" style={{ animationDelay: "1s" }} fill="none" stroke="rgba(239, 68, 68, 0.05)" strokeWidth="0.5" />
            <circle cx="70" cy="45" r="3" className="float-slow" style={{ animationDelay: "2s" }} fill="none" stroke="rgba(239, 68, 68, 0.06)" strokeWidth="0.4" />
          </svg>

          {/* Layer 3: IoT Sensor Node Connections (Visible in Sections 4, 5) */}
          <svg className={`bg-svg-layer ${[3, 4].includes(activeSectionIndex) ? "active" : ""}`}
               viewBox="0 0 100 100" style={{ left: "5%", top: "20%", width: "90%", height: "60%" }}>
            {/* Grid nodes */}
            <circle cx="20" cy="30" r="1.5" fill="var(--theme-green-primary)" />
            <circle cx="40" cy="70" r="1.5" fill="var(--theme-green-primary)" />
            <circle cx="60" cy="25" r="1.5" fill="var(--theme-green-primary)" />
            <circle cx="80" cy="60" r="1.5" fill="var(--theme-green-primary)" />
            
            {/* Connection Lines */}
            <line x1="20" y1="30" x2="40" y2="70" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="40" y1="70" x2="60" y2="25" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="60" y1="25" x2="80" y2="60" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="20" y1="30" x2="60" y2="25" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="0.4" />
          </svg>

          {/* Layer 4: AI Brain/Network Hub (Visible in Sections 7, 8) */}
          <svg className={`bg-svg-layer spin-reverse-slow ${[6, 7].includes(activeSectionIndex) ? "active" : ""}`}
               viewBox="0 0 100 100" style={{ right: "10%", top: "15%", width: "35%" }}>
            <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" className="pulse-slow" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="0.5" strokeDasharray="6 4" />
            
            {/* Node rays */}
            <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="90" y2="50" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="15" y2="70" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="75" y2="75" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.5" />
          </svg>

          {/* Layer 5: Clean Smart City & Turbines (Visible in Sections 6, 10, 11) */}
          <svg className={`bg-svg-layer ${[5, 9, 10].includes(activeSectionIndex) ? "active" : ""}`}
               viewBox="0 0 100 100" style={{ left: "5%", bottom: "5%", width: "30%" }}>
            {/* Solar Panel drawing */}
            <path d="M 10 90 L 25 80 L 45 80 L 30 90 Z" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.8" />
            <line x1="17.5" y1="85" x2="37.5" y2="85" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.5" />
            <line x1="22.5" y1="80" x2="17.5" y2="90" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.5" />
            <line x1="35" y1="80" x2="30" y2="90" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.5" />
            
            {/* Wind Turbine Pole 1 */}
            <line x1="75" y1="90" x2="75" y2="50" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
            {/* Rotator (Custom styled in CSS with spin) */}
            <g className="spin-slow" style={{ transformOrigin: "75px 50px" }}>
              <line x1="75" y1="50" x2="75" y2="30" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="0.8" />
              <line x1="75" y1="50" x2="92.3" y2="60" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="0.8" />
              <line x1="75" y1="50" x2="57.7" y2="60" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="0.8" />
            </g>
          </svg>

        </div>
      </div>

      {/* --- SECTION 1: HERO --- */}
      <section ref={refHero} data-section-index="0" className="scroll-section in-view">
        <div className="section-content-container hero-content-grid">
          
          {/* Left Column: Headline, Description & CTAs */}
          <div className="hero-left-column reveal-on-scroll">
            <h1 className="hero-title" style={{ marginBottom: "12px" }}>
              Smart<span>CarbonTrack</span>
            </h1>
            <h2 className="hero-subtitle">
              Industrial Carbon Intelligence Platform for Modern Manufacturing
            </h2>
            <p className="hero-desc">
              Optimize your operational sustainability with a unified enterprise platform designed for 
              carbon emission monitoring, AI-powered forecasting, carbon credit estimation, 
              ESG compliance auditing, deep manufacturing analytics, and clean energy optimization.
            </p>
            
            <div className="hero-ctas">
              <button onClick={() => scrollToNext(1)} className="btn-primary-glow">
                Explore SmartCarbonTrack
              </button>
              <a href="/login" className="btn-secondary-link">
                Quick Login
              </a>
            </div>

            <div className="scroll-indicator" onClick={() => scrollToNext(1)} style={{ cursor: "pointer", marginTop: "40px" }}>
              <span>Scroll to Discover</span>
              <div className="mouse-icon">
                <div className="mouse-wheel" />
              </div>
            </div>
          </div>

          {/* Right Column: Floating Glassmorphism KPI Cards */}
          <div className="hero-right-column reveal-on-scroll">
            
            {/* Floating Card 1: Carbon Footprint */}
            <div className="hero-card-wrapper-1 animate-float-1" style={{ position: "absolute", top: "12%", left: "5%" }}>
              <div className="glass-panel floating-kpi-card" style={{
                transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`
              }}>
                <div className="hero-card-icon"><FiActivity /></div>
                <div>
                  <div className="hero-card-val">3,450.8 MT</div>
                  <div className="hero-card-lbl">Carbon Footprint</div>
                </div>
              </div>
            </div>

            {/* Floating Card 2: AI Forecast */}
            <div className="hero-card-wrapper-2 animate-float-2" style={{ position: "absolute", top: "35%", right: "5%" }}>
              <div className="glass-panel floating-kpi-card" style={{
                transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`
              }}>
                <div className="hero-card-icon" style={{ color: "var(--theme-green-primary)" }}><FiCpu /></div>
                <div>
                  <div className="hero-card-val">-14.2%</div>
                  <div className="hero-card-lbl">AI Forecast Var</div>
                </div>
              </div>
            </div>

            {/* Floating Card 3: Energy Saved */}
            <div className="hero-card-wrapper-3 animate-float-3" style={{ position: "absolute", bottom: "30%", left: "10%" }}>
              <div className="glass-panel floating-kpi-card" style={{
                transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`
              }}>
                <div className="hero-card-icon" style={{ color: "#eab308" }}><FiSun /></div>
                <div>
                  <div className="hero-card-val">42.5%</div>
                  <div className="hero-card-lbl">Total RE Offset</div>
                </div>
              </div>
            </div>

            {/* Floating Card 4: Carbon Credits */}
            <div className="hero-card-wrapper-4 animate-float-4" style={{ position: "absolute", bottom: "10%", right: "12%" }}>
              <div className="glass-panel floating-kpi-card" style={{
                transform: `translate(${mousePos.x * -35}px, ${mousePos.y * -35}px)`
              }}>
                <div className="hero-card-icon" style={{ color: "#06b6d4" }}><FiTarget /></div>
                <div>
                  <div className="hero-card-val">1,250</div>
                  <div className="hero-card-lbl">Credits Accrued</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* --- SECTION 2: ABOUT --- */}
      <section ref={refAbout} data-section-index="1" className="scroll-section">
        <div className="section-content-container reveal-on-scroll blur-effect">
          <span className="section-tag">Enterprise Vision</span>
          <div className="about-grid">
            <div className="about-text-container">
              <h2 className="section-title-large">Why SmartCarbonTrack Exists</h2>
              <p className="section-subtitle-large" style={{ marginBottom: 20 }}>
                Traditional manufacturing has long suffered from manual carbon tracking spreadsheets, 
                isolated energy metrics, and complex compliance frameworks. We built SmartCarbonTrack to 
                bridge the gap between industrial operations and environmental intelligence.
              </p>
              <p className="section-subtitle-large">
                By digitizing fuel consumption logs, integrating grid metrics, and deploying predictive 
                AI models, we empower plant managers to replace guesswork with certified audit readiness.
              </p>
              <div className="industry-tags">
                <span className="industry-tag">Steel Units</span>
                <span className="industry-tag">Cement Works</span>
                <span className="industry-tag">Automotive Hubs</span>
                <span className="industry-tag">Textile Factories</span>
                <span className="industry-tag">Chemical Refineries</span>
                <span className="industry-tag">Pharma Labs</span>
              </div>
            </div>
            
            <div className="glass-panel about-card-stat">
              <div className="about-stat-num">
                <CountUp end={85} suffix="%" trigger={activeSectionIndex >= 1} />
              </div>
              <div className="about-stat-lbl">
                Reduction in spreadsheet-based reporting overhead
              </div>
              <hr style={{ width: "80%", border: "none", borderTop: "1px solid rgba(0,0,0,0.06)", margin: "10px 0" }} />
              <div className="about-stat-num" style={{ color: "var(--theme-green-primary)" }}>
                <CountUp end={10} suffix="x" trigger={activeSectionIndex >= 1} />
              </div>
              <div className="about-stat-lbl">
                Faster compliance data verifiability audit speeds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: CHALLENGES --- */}
      <section ref={refChallenges} data-section-index="2" className="scroll-section">
        <div className="section-content-container reveal-on-scroll">
          <span className="section-tag">Industrial Obstacles</span>
          <h2 className="section-title-large">The Realities of Modern Manufacturing</h2>
          <p className="section-subtitle-large">
            Plant managers face rising carbon pricing, energy market volatility, and stringent global 
            regulatory updates. Identifying emission leaks is critical.
          </p>

          <div className="challenges-grid">
            <div className="glass-panel challenge-card">
              <div className="challenge-icon-box"><FiAlertTriangle /></div>
              <div className="challenge-title">High Carbon Loads</div>
              <div className="challenge-desc">Heavy manufacturing (steel, cement) releases high carbon loads that trigger carbon tax limits without real-time tracking.</div>
            </div>
            
            <div className="glass-panel challenge-card">
              <div className="challenge-icon-box"><FiSettings /></div>
              <div className="challenge-title">Manual Tracking</div>
              <div className="challenge-desc">Data stored across isolated paper records and logs, causing delays, computation errors, and audit failures.</div>
            </div>
            
            <div className="glass-panel challenge-card">
              <div className="challenge-icon-box"><FiZap /></div>
              <div className="challenge-title">Energy Inefficiency</div>
              <div className="challenge-desc">Untracked peak load grid demand and furnace oil leaks increase operational overheads silently.</div>
            </div>
            
            <div className="glass-panel challenge-card">
              <div className="challenge-icon-box"><FiLayers /></div>
              <div className="challenge-title">Audit Complexity</div>
              <div className="challenge-desc">Compiling Scope 1 direct fuels and Scope 2 electricity logs for third-party audits takes weeks.</div>
            </div>
            
            <div className="glass-panel challenge-card">
              <div className="challenge-icon-box"><FiTarget /></div>
              <div className="challenge-title">Credit Losses</div>
              <div className="challenge-desc">Missing carbon credit generation parameters due to a lack of verified carbon accounting offsets.</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: HOW IT WORKS TIMELINE --- */}
      <section ref={refWorks} data-section-index="3" className="scroll-section">
        <div className="section-content-container reveal-on-scroll">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="section-tag">Process Pipeline</span>
            <h2 className="section-title-large">The Carbon Accounting Pipeline</h2>
            <p className="section-subtitle-large" style={{ margin: "0 auto" }}>
              See how SmartCarbonTrack ingests raw factory parameters and refines it into board-ready ESG compilations.
            </p>
          </div>

          <div className="timeline-wrapper">
            <div className="timeline-line" />
            <div className="timeline-line-progress" style={{ height: `${Math.min(100, Math.max(0, (activeSectionIndex - 3) * 50))}%` }} />
            
            <div className={`timeline-node-item ${activeSectionIndex >= 3 ? "active" : ""}`}>
              <div className="timeline-bullet" />
              <div className="glass-panel timeline-card">
                <div className="timeline-node-num">Step 01</div>
                <div className="timeline-node-title">Factory Operations Log</div>
                <div className="timeline-node-desc">Inputs of direct fuel (HSD, Furnace Oil, LPG, Biomass) and beverage/product output logs.</div>
              </div>
            </div>
            
            <div className={`timeline-node-item ${activeSectionIndex >= 3.3 ? "active" : ""}`}>
              <div className="timeline-bullet" />
              <div className="glass-panel timeline-card">
                <div className="timeline-node-num">Step 02</div>
                <div className="timeline-node-title">Real-Time Data Ingestion</div>
                <div className="timeline-node-desc">Grid power meter readings, solar production logs, and IoT nodes feed directly into the central cloud engine.</div>
              </div>
            </div>

            <div className={`timeline-node-item ${activeSectionIndex >= 3.6 ? "active" : ""}`}>
              <div className="timeline-bullet" />
              <div className="glass-panel timeline-card">
                <div className="timeline-node-num">Step 03</div>
                <div className="timeline-node-title">Emission Calculation Engine</div>
                <div className="timeline-node-desc">Calculates CO₂ mass flow rates using global coefficients, separating Scope 1 and Scope 2 footprints instantly.</div>
              </div>
            </div>

            <div className={`timeline-node-item ${activeSectionIndex >= 3.9 ? "active" : ""}`}>
              <div className="timeline-bullet" />
              <div className="glass-panel timeline-card">
                <div className="timeline-node-num">Step 04</div>
                <div className="timeline-node-title">AI Optimization & Credit Compiling</div>
                <div className="timeline-node-desc">Algorithms analyze intensity levels, forecast anomalies, and estimate accrued carbon offset credits.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: FEATURES SHOWCASE --- */}
      <section ref={refFeatures} data-section-index="4" className="scroll-section">
        <div className="section-content-container reveal-on-scroll">
          <span className="section-tag">Core Capabilities</span>
          <h2 className="section-title-large">SaaS Features Built for Heavy Industry</h2>
          <p className="section-subtitle-large">
            Every feature is developed to match strict industrial constraints, ensuring verifiability, data security, and ease of use.
          </p>

          <div className="features-container-grid">
            <div className="glass-panel feature-item-card">
              <div className="feature-icon-wrapper"><FiActivity /></div>
              <div className="feature-title-text">Real-Time Carbon Monitoring</div>
              <div className="feature-desc-text">Track plant-wide emission rates updated dynamically based on operational data.</div>
            </div>

            <div className="glass-panel feature-item-card">
              <div className="feature-icon-wrapper"><FiSettings /></div>
              <div className="feature-title-text">Emission Calculator</div>
              <div className="feature-desc-text">Convert diverse fuel consumption (liters, SCM, kgs) to MT carbon equivalencies.</div>
            </div>

            <div className="glass-panel feature-item-card">
              <div className="feature-icon-wrapper"><FiCpu /></div>
              <div className="feature-title-text">AI Emission Forecasting</div>
              <div className="feature-desc-text">Predict emissions up to 12 months ahead based on seasonal patterns.</div>
            </div>

            <div className="glass-panel feature-item-card">
              <div className="feature-icon-wrapper"><FiTarget /></div>
              <div className="feature-title-text">Carbon Credit Prediction</div>
              <div className="feature-desc-text">Forecast accrued credits from clean fuel operations.</div>
            </div>

            <div className="glass-panel feature-item-card">
              <div className="feature-icon-wrapper"><FiGlobe /></div>
              <div className="feature-title-text">ESG Compliance Tracking</div>
              <div className="feature-desc-text">Align datasets directly to global reporting frameworks (CDP, BRSR, GHG).</div>
            </div>

            <div className="glass-panel feature-item-card">
              <div className="feature-icon-wrapper"><FiFileText /></div>
              <div className="feature-title-text">Automated Reports</div>
              <div className="feature-desc-text">Generate ready-to-audit corporate sustainability PDFs and Excel logs.</div>
            </div>

            <div className="glass-panel feature-item-card">
              <div className="feature-icon-wrapper"><FiLayers /></div>
              <div className="feature-title-text">Multi-Plant Comparison</div>
              <div className="feature-desc-text">Compare energy intensity and carbon loads across regional manufacturing units.</div>
            </div>

            <div className="glass-panel feature-item-card">
              <div className="feature-icon-wrapper"><FiTrendingUp /></div>
              <div className="feature-title-text">Department Analytics</div>
              <div className="feature-desc-text">Isolate emissions caused by specific boiler, logistics, or production departments.</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 6: KPI SECTION --- */}
      <section ref={refKpis} data-section-index="5" className="scroll-section">
        <div className="section-content-container reveal-on-scroll">
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <span className="section-tag">Platform Statistics</span>
            <h2 className="section-title-large">SmartCarbonTrack in Numbers</h2>
            <p className="section-subtitle-large" style={{ margin: "0 auto" }}>
              Our enterprise footprints showing industrial data volumes managed by the system globally.
            </p>
          </div>

          <div className="kpi-stat-grid">
            <div className="glass-panel kpi-stat-card">
              <div className="kpi-stat-number">
                <CountUp end={1200000} suffix="+" trigger={activeSectionIndex >= 5} />
              </div>
              <div className="kpi-stat-label">Total CO₂ Monitored</div>
              <div className="kpi-stat-sub">Metric Tons of carbon tracked</div>
            </div>

            <div className="glass-panel kpi-stat-card">
              <div className="kpi-stat-number">
                <CountUp end={48} trigger={activeSectionIndex >= 5} />
              </div>
              <div className="kpi-stat-label">Connected Units</div>
              <div className="kpi-stat-sub">Heavy manufacturing plants online</div>
            </div>

            <div className="glass-panel kpi-stat-card">
              <div className="kpi-stat-number">
                <CountUp end={12450} trigger={activeSectionIndex >= 5} />
              </div>
              <div className="kpi-stat-label">Credits Compiled</div>
              <div className="kpi-stat-sub">Carbon offsets computed accurately</div>
            </div>

            <div className="glass-panel kpi-stat-card">
              <div className="kpi-stat-number">
                <CountUp end={98} suffix=".6%" trigger={activeSectionIndex >= 5} />
              </div>
              <div className="kpi-stat-label">AI Forecast Accuracy</div>
              <div className="kpi-stat-sub">Machine learning regression matching</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 7: DASHBOARD PREVIEW --- */}
      <section ref={refDashboard} data-section-index="6" className="scroll-section">
        <div className="section-content-container reveal-on-scroll">
          <span className="section-tag">User Interface</span>
          <h2 className="section-title-large">The Manager Dashboard Preview</h2>
          <p className="section-subtitle-large">
            Get a glimpse of the intuitive layout that plant managers use to monitor real-time carbon intensity, energy grids, and alert conditions.
          </p>

          <div className="dashboard-preview-window glass-panel">
            {/* Sidebar Mock */}
            <div className="db-mock-sidebar">
              <div className="db-mock-logo-box">
                <div className="db-mock-logo">CarbonTrack</div>
                <div className="db-mock-logo-sub">Sustainability Portal</div>
              </div>
              <div className="db-mock-nav">
                <div className="db-mock-nav-item active"><FiGrid /> Dashboard</div>
                <div className="db-mock-nav-item"><FiDatabase /> Data Entry</div>
                <div className="db-mock-nav-item"><FiActivity /> Analytics</div>
                <div className="db-mock-nav-item"><FiFileText /> Reports</div>
                <div className="db-mock-nav-item"><FiSettings /> Settings</div>
              </div>
            </div>

            {/* Dashboard Panel Mock */}
            <div className="db-mock-panel">
              <div className="db-mock-header">
                <h3 className="db-mock-header-title">Bhopal Beverage Plant</h3>
                <span style={{ fontSize: 13, background: "white", padding: "6px 12px", borderRadius: 8, fontWeight: 600 }}>📅 July 2026</span>
              </div>

              {/* KPIs Row */}
              <div className="db-mock-kpis">
                <div className="db-mock-kpi-card">
                  <div className="db-mock-kpi-icon"><FiSun /></div>
                  <div className="db-mock-kpi-details">
                    <span className="db-mock-kpi-lbl">Total RE %</span>
                    <span className="db-mock-kpi-val">42.5%</span>
                  </div>
                </div>

                <div className="db-mock-kpi-card">
                  <div className="db-mock-kpi-icon"><FiWind /></div>
                  <div className="db-mock-kpi-details">
                    <span className="db-mock-kpi-lbl">Green Fuel %</span>
                    <span className="db-mock-kpi-val">18.2%</span>
                  </div>
                </div>

                <div className="db-mock-kpi-card">
                  <div className="db-mock-kpi-icon"><FiActivity /></div>
                  <div className="db-mock-kpi-details">
                    <span className="db-mock-kpi-lbl">Carbon (MT)</span>
                    <span className="db-mock-kpi-val">3,450.8</span>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="db-mock-charts">
                <div className="db-mock-chart-card">
                  <div className="db-mock-chart-title">Monthly Emission Trend (MT CO₂)</div>
                  {/* Custom SVG Area Chart */}
                  <svg viewBox="0 0 300 120" style={{ width: "100%", height: 120 }}>
                    <path d="M 0 100 Q 50 80 100 90 T 200 40 T 300 30 L 300 120 L 0 120 Z" fill="rgba(16, 185, 129, 0.12)" className="svg-area-path" />
                    <path d="M 0 100 Q 50 80 100 90 T 200 40 T 300 30" fill="none" stroke="var(--theme-green-primary)" strokeWidth="3" className="svg-line-path" />
                    <circle cx="100" cy="90" r="4" fill="var(--theme-green-primary)" />
                    <circle cx="200" cy="40" r="4" fill="var(--theme-green-primary)" />
                    <circle cx="300" cy="30" r="4" fill="var(--theme-green-primary)" />
                  </svg>
                </div>

                <div className="db-mock-chart-card">
                  <div className="db-mock-chart-title">Energy Source Breakdown</div>
                  {/* Custom SVG Bar Chart */}
                  <svg viewBox="0 0 150 120" style={{ width: "100%", height: 120 }}>
                    {/* Grid Power Bar */}
                    <rect x="25" y="40" width="24" height="60" rx="4" fill="#0f766e" />
                    <text x="37" y="115" fontSize="9" textAnchor="middle" fill="#64748b">Grid</text>
                    {/* Solar Bar */}
                    <rect x="65" y="60" width="24" height="40" rx="4" fill="#10b981" />
                    <text x="77" y="115" fontSize="9" textAnchor="middle" fill="#64748b">Solar</text>
                    {/* Wind Bar */}
                    <rect x="105" y="80" width="24" height="20" rx="4" fill="#34d399" />
                    <text x="117" y="115" fontSize="9" textAnchor="middle" fill="#64748b">Wind</text>
                  </svg>
                </div>
              </div>

              {/* Alert Mock */}
              <div className="db-mock-alert">
                <span className="db-mock-alert-tag">AI recommendation</span>
                <span>Shift 12% grid load to solar during peak hours (12 PM - 3 PM) to reduce emissions by 14.5 MT.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 8: AI INTELLIGENCE --- */}
      <section ref={refAi} data-section-index="7" className="scroll-section">
        <div className="section-content-container reveal-on-scroll">
          <span className="section-tag">Machine Learning Core</span>
          <h2 className="section-title-large">Interactive AI Optimization</h2>
          <p className="section-subtitle-large">
            Adjust the manufacturing production load slider below to see how our predictive models calculate emission forecasts, carbon offset credits, and alert risk thresholds.
          </p>

          <div className="ai-interactive-panel">
            <div className="ai-controls">
              
              <div className="glass-panel ai-slider-box" style={{ padding: 24 }}>
                <div className="ai-slider-label">
                  <span>Plant Production Capacity</span>
                  <span style={{ fontWeight: 800, color: "var(--theme-green-dark)" }}>{productionLoad}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={productionLoad} 
                  onChange={(e) => setProductionLoad(parseInt(e.target.value))} 
                  className="ai-slider" 
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)" }}>
                  <span>50% (Eco Load)</span>
                  <span>100% (Baseline)</span>
                  <span>150% (Maximum Output)</span>
                </div>
              </div>

              <div className="ai-output-cards">
                <div className="glass-panel ai-output-card">
                  <div className="ai-output-val">{simulatedEmissions} MT</div>
                  <div className="ai-output-lbl">Projected Carbon Output</div>
                </div>

                <div className="glass-panel ai-output-card">
                  <div className="ai-output-val" style={{ color: simulatedAnomalyRisk === "HIGH" ? "#ef4444" : "var(--theme-green-dark)" }}>
                    {simulatedAnomalyRisk}
                  </div>
                  <div className="ai-output-lbl">Anomaly Risk Level</div>
                </div>

                <div className="glass-panel ai-output-card">
                  <div className="ai-output-val">{simulatedCredits}</div>
                  <div className="ai-output-lbl">Estimated Credits Accrued</div>
                </div>

                <div className="glass-panel ai-output-card">
                  <div className="ai-output-val">{simulatedSavings}%</div>
                  <div className="ai-output-lbl">Carbon Credit Ratio</div>
                </div>
              </div>

            </div>

            {/* AI Visual Animation Display */}
            <div className="ai-visual-widget">
              <div className="ai-pulse-center">
                <FiCpu />
                <div className="ai-pulse-wave" />
              </div>
              
              <div style={{ marginTop: 24, textAlign: "center", zIndex: 2 }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>AI Core Operating</h4>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
                  Ingesting parameters... applying gradient boost regression trees.
                </p>
              </div>

              {simulatedAnomalyRisk === "HIGH" && (
                <div className="ai-anomaly-box">
                  <FiAlertTriangle /> HIGH LOAD WARNING: Blast Furnace Gas Scrubber bypass detected. Throttling recommended.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 9: ESG COMPLIANCE CHECKLIST --- */}
      <section ref={refCompliance} data-section-index="8" className="scroll-section">
        <div className="section-content-container reveal-on-scroll">
          <span className="section-tag">ESG Compliance & Reports</span>
          <h2 className="section-title-large">Certified Audit Readiness</h2>
          <p className="section-subtitle-large">
            Align your plant operations directly to global and regional regulatory frameworks. Compile, verify, and export reports in seconds.
          </p>

          <div className="compliance-checklist-box">
            
            {/* Checklist Column */}
            <div className="checklist-items">
              {checklist.map(item => (
                <div 
                  key={item.id} 
                  className={`checklist-item glass-panel ${item.checked ? "active" : ""}`}
                  onClick={() => toggleChecklist(item.id)}
                >
                  <div className="checklist-checkbox">
                    {item.checked && <FiCheckSquare />}
                  </div>
                  <div className="checklist-details">
                    <span className="checklist-title">{item.label}</span>
                    <span className="checklist-desc">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Badges Column */}
            <div className="compliance-logos-grid">
              <div className="glass-panel compliance-badge">
                <div className="compliance-badge-name">BRSR</div>
                <div className="compliance-badge-desc">Business Responsibility & Sustainability Reporting</div>
              </div>

              <div className="glass-panel compliance-badge">
                <div className="compliance-badge-name">GHG Protocol</div>
                <div className="compliance-badge-desc">Greenhouse Gas Corporate Standards Scope 1, 2 & 3</div>
              </div>

              <div className="glass-panel compliance-badge">
                <div className="compliance-badge-name">CDP</div>
                <div className="compliance-badge-desc">Carbon Disclosure Project compliance reporting parameters</div>
              </div>

              <div className="glass-panel compliance-badge">
                <div className="compliance-badge-name">ISO 14064</div>
                <div className="compliance-badge-desc">International standards for carbon offset verification</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECTION 10: BUSINESS IMPACT --- */}
      <section ref={refImpact} data-section-index="9" className="scroll-section">
        <div className="section-content-container reveal-on-scroll">
          <span className="section-tag">Financial & Operations</span>
          <h2 className="section-title-large">Tangible Industrial Business Value</h2>
          <p className="section-subtitle-large">
            SmartCarbonTrack goes beyond environmental metrics to deliver core bottom-line savings and regulatory risk mitigations.
          </p>

          <div className="impact-cards-grid">
            <div className="glass-panel impact-card">
              <div className="impact-metric">12%</div>
              <div className="impact-title">Reduced Energy Costs</div>
              <div className="impact-desc">AI anomalies alert plant operators to gas leaks, grid load imbalances, and baseline fuel waste.</div>
            </div>

            <div className="glass-panel impact-card">
              <div className="impact-metric">28,000+</div>
              <div className="impact-title">Accrued Credits Value</div>
              <div className="impact-desc">Plants compile verified cleaner production offsets into tradable financial assets.</div>
            </div>

            <div className="glass-panel impact-card">
              <div className="impact-metric">95%</div>
              <div className="impact-title">Faster ESG Compliancy</div>
              <div className="impact-desc">One-click compilers automate compliance reporting, eliminating manual spreadsheet hours completely.</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 11: FINAL CTA --- */}
      <section ref={refFinal} data-section-index="10" className="scroll-section" style={{ minHeight: "90vh" }}>
        <div className="section-content-container">
          <div className="glass-panel final-cta-card">
            <span className="section-tag">Access SmartCarbonTrack Portal</span>
            <h2 className="final-cta-title">
              Experience the Future of <span>Industrial Carbon Intelligence</span>
            </h2>
            <p className="final-cta-subtitle">
              Ready to reduce carbon footprint, optimize energy consumption, and manage carbon credits in a single enterprise platform?
            </p>
            <a href="/login" className="btn-pulse-glow">
              Continue to Login <FiArrowRight style={{ marginLeft: 8 }} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
