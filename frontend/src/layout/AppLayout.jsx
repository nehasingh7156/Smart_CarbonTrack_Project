import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  const plant = localStorage.getItem("plant") || "Select Plant";
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const pageName =
    location.pathname.split("/").pop() || "home";

  return (
    <div className="app-layout-container" style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="app-content-column" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar plant={plant} page={pageName} collapsed={collapsed} setCollapsed={setCollapsed} />

        <main
          className="app-main-content"
          style={{
            flex: 1,
            padding: "36px 40px",
            background: "#f8fafc",
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
            position: "relative",
            overflowY: "auto"
          }}
        >
          {/* Soft ambient background glows */}
          <div style={{
            position: "absolute",
            top: "5%",
            right: "5%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
            pointerEvents: "none",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            width: "450px",
            height: "450px",
            background: "radial-gradient(circle, rgba(15, 23, 42, 0.02) 0%, rgba(255, 255, 255, 0) 70%)",
            pointerEvents: "none",
            zIndex: 0
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


