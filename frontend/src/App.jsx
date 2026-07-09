import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import GetStarted from "./pages/GetStarted";
import Home from "./pages/Home";
import InputForm from "./pages/InputForm";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Forecasting from "./pages/Forecasting";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import AppLayout from "./layout/AppLayout";
import AdminLayout from "./layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPlantDetail from "./pages/AdminPlantDetail";

function App() {
  const [dashboardData, setDashboardData] = useState(null);

  return (
    <BrowserRouter>
      <Routes>

        {/* Landing & Get Started */}
        <Route path="/" element={<GetStarted />} />
        <Route path="/login" element={<Landing />} />

        {/* Plant Manager Layout protected */}
        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/app" element={<AppLayout />}>

            {/* default route */}
            <Route index element={<Navigate to="home" />} />

            <Route path="home" element={<Home />} />

            <Route
              path="data-entry"
              element={<InputForm setDashboardData={setDashboardData} />}
            />

            <Route
              path="dashboard"
              element={<Dashboard data={dashboardData} />}
            />

            <Route path="analytics" element={<Analytics />} />
            <Route path="forecasting" element={<Forecasting />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />

          </Route>
        </Route>

        {/* Admin Layout protected */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="plant/:plantId" element={<AdminPlantDetail />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/"/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;


