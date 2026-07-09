import { Outlet, useLocation, useParams } from "react-router-dom";
import Topbar from "../components/Topbar";

export default function AdminLayout() {
  const location = useLocation();
  const { plantId } = useParams();

  // Determine topbar values
  let pageName = "Dashboard";
  let topbarTitle = "Admin Panel";

  if (location.pathname.includes("plant/") && plantId) {
    pageName = "Plant Detail";
    topbarTitle = plantId;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* ❌ NO SIDEBAR */}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Topbar plant={topbarTitle} page={pageName} />

        <main
          style={{
            flex: 1,
            padding: "36px 40px",
            background: "#f8fafc",
            backgroundImage: `
              linear-gradient(rgba(15, 118, 110, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15, 118, 110, 0.02) 1px, transparent 1px)
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
            background: "radial-gradient(circle, rgba(15, 118, 110, 0.04) 0%, rgba(255, 255, 255, 0) 70%)",
            pointerEvents: "none",
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            width: "450px",
            height: "450px",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.02) 0%, rgba(255, 255, 255, 0) 70%)",
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
