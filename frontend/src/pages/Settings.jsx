import React, { useState, useEffect } from "react";
import { 
  FiSettings, FiSave, FiRefreshCw, FiCheck, FiMoon, FiSun, FiInfo, FiUpload, FiDownload, FiTrash2, FiAlertCircle
} from "react-icons/fi";

// DEFAULT CONFIGURATIONS
const defaultSettings = {
  // A. General
  plantName: "Select Plant",
  reportingMonth: "Jan",
  timeZone: "Asia/Kolkata",
  // B. Units
  electricityUnit: "kWh",
  fuelUnit: "liter",
  energyUnit: "MJ",
  // C. Emission Factors
  gridFactor: 0.82,
  useCustomFactors: false,
  fuelFactors: [
    { id: 'hsd', name: 'HSD (Diesel)', val: 2.68, unit: 'kg/L' },
    { id: 'fur', name: 'Furnace Oil', val: 2.68, unit: 'kg/L' },
    { id: 'lpg', name: 'LPG', val: 2.98, unit: 'kg/kg' },
    { id: 'png', name: 'PNG', val: 2.02, unit: 'kg/SCM' },
    { id: 'bio', name: 'Biomass', val: 0.05, unit: 'kg/MJ' }
  ],
  // D. Classification (simulated as active green fuels)
  greenFuels: ['bio'],
  // E. Dashboard Preferences
  chartCount: 4,
  chartTypeDefault: "bar",
  chartXAxis: "Month",
  chartYAxis: "Emissions",
  // F. Chart Appearance
  theme: "light", // 'light' or 'dark'
  chartBrand: "Teal",
  showLabels: true,
  showLegends: true,
  // G. Report Settings
  reportFormat: "PDF",
  reportMethodology: true,
  reportFactors: false,
  // H. Data Management
  lockMonths: false,
  // I. Notifications
  alertEmission: true,
  alertEmissionThreshold: 2500,
  alertRenewable: false,
  alertIntensity: true
};

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const savedStr = localStorage.getItem("smartCarbon_settings");
    const activePlant = localStorage.getItem("plant") || "Select Plant";
    let init = savedStr ? JSON.parse(savedStr) : { ...defaultSettings };
    init.plantName = activePlant;
    return init;
  });

  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync Global Theme Injector
  useEffect(() => {
    if (settings.theme === "dark") {
      document.body.classList.add("dark-mode-activated");
      const existing = document.getElementById("global-dark-mode-style");
      if (!existing) {
        const style = document.createElement("style");
        style.id = "global-dark-mode-style";
        style.innerHTML = `
          body.dark-mode-activated,
          body.dark-mode-activated [style*="linear-gradient"],
          body.dark-mode-activated [style*="background: linear-gradient"],
          body.dark-mode-activated [style*="background:linear-gradient"] {
             background: #0f172a !important;
             color: #f1f5f9 !important;
          }
          body.dark-mode-activated .settings-card,
          body.dark-mode-activated div[style*="rgba(255, 255, 255"],
          body.dark-mode-activated div[style*="rgba(255,255,255"] {
             background: #1e293b !important;
             border-color: #334155 !important;
             color: #f8fafc !important;
             box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
          }
          body.dark-mode-activated h1, 
          body.dark-mode-activated h2, 
          body.dark-mode-activated h3, 
          body.dark-mode-activated h4,
          body.dark-mode-activated label,
          body.dark-mode-activated select,
          body.dark-mode-activated input {
             color: inherit !important;
          }
          body.dark-mode-activated select,
          body.dark-mode-activated input {
             background: #0f172a !important;
             border-color: #475569 !important;
          }
          body.dark-mode-activated tr:nth-child(even) { background: transparent !important; }
          body.dark-mode-activated thead { background: #0f172a !important; }
        `;
        document.head.appendChild(style);
      }
    } else {
      document.body.classList.remove("dark-mode-activated");
      const style = document.getElementById("global-dark-mode-style");
      if (style) style.remove();
    }
    
    // Attempt to sync local plantName with legacy localStorage var if it exists
    localStorage.setItem("plant", settings.plantName);
    
  }, [settings.theme, settings.plantName]);

  const handleChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFactorChange = (id, newVal) => {
    setSettings(prev => ({
      ...prev,
      fuelFactors: prev.fuelFactors.map(f => f.id === id ? { ...f, val: newVal } : f)
    }));
  };

  const handleFuelClassToggle = (id) => {
    setSettings(prev => {
      const isGreen = prev.greenFuels.includes(id);
      return {
        ...prev,
        greenFuels: isGreen ? prev.greenFuels.filter(f => f !== id) : [...prev.greenFuels, id]
      };
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    // Mock API Delay
    setTimeout(() => {
      localStorage.setItem("smartCarbon_settings", JSON.stringify(settings));
      setIsSaving(false);
      showToast("Settings successfully saved to database!");
    }, 800);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to revert all settings to factory default?")) {
      setSettings(defaultSettings);
      localStorage.removeItem("smartCarbon_settings");
      showToast("Settings reverted to defaults.");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const isDark = settings.theme === "dark";

  return (
    <div style={{
      background: "linear-gradient(135deg, #e0f2fe, #ccfbf1, #dcfce7)",
      minHeight: "100vh",
      padding: "32px 40px",
      fontFamily: "'Inter', sans-serif",
      color: "#0f172a",
      paddingBottom: 100
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 32, position: "relative" }}>
        {/* Dark Mode Quick Toggle */}
        <div style={{ position: "absolute", top: 0, right: 0 }}>
             <button onClick={() => handleChange("theme", isDark ? "light" : "dark")} style={{
                 background: isDark ? "#1e293b" : "#fff", color: isDark ? "#e2e8f0" : "#475569", border: "1px solid", borderColor: isDark ? "#334155" : "#cbd5e1",
                 display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 700,
                 boxShadow: "0 4px 6px rgba(0,0,0,0.05)", transition: "0.2s"
             }}>
                 {isDark ? <FiMoon color="#3b82f6"/> : <FiSun color="#f59e0b"/>}
                 {isDark ? "Dark Mode" : "Light Mode"}
             </button>
        </div>

        <h1 style={{ color: "#0f766e", margin: 0, fontSize: 36, fontWeight: 900, textShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          Settings
        </h1>
        <p style={{ margin: "10px 0 0 0", color: "#475569", fontSize: 18, fontWeight: 500 }}>
          Manage your system preferences and configurations
        </p>
      </div>

      {/* SETTINGS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24, maxWidth: 1200, margin: "0 auto" }}>

        {/* A. General Preferences */}
        <SettingsCard title="General Preferences">
           <FieldGroup label="Default Plant Name">
              <input type="text" value={settings.plantName} onChange={e => handleChange("plantName", e.target.value)} style={inputTheme} />
           </FieldGroup>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
               <FieldGroup label="Default Reporting Month">
                  <select value={settings.reportingMonth} onChange={e => handleChange("reportingMonth", e.target.value)} style={inputTheme}>
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => <option key={m}>{m}</option>)}
                  </select>
               </FieldGroup>
               <FieldGroup label="Time Zone">
                  <select value={settings.timeZone} onChange={e => handleChange("timeZone", e.target.value)} style={inputTheme}>
                      <option>Asia/Kolkata</option>
                      <option>UTC</option>
                      <option>EST</option>
                  </select>
               </FieldGroup>
           </div>
        </SettingsCard>

        {/* B. Units & Measurements */}
        <SettingsCard title="Units & Measurements">
            <ToggleSwitch label="Electricity Units" p1="kWh" p2="MWh" val={settings.electricityUnit} set={v => handleChange("electricityUnit", v)} />
            <FieldGroup label="Fuel Default Unit">
                  <select value={settings.fuelUnit} onChange={e => handleChange("fuelUnit", e.target.value)} style={inputTheme}>
                      <option value="liter">Liters</option>
                      <option value="kg">Kilograms</option>
                      <option value="SCM">SCM</option>
                      <option value="MJ">MJ</option>
                  </select>
            </FieldGroup>
            <ToggleSwitch label="Energy Conversion Unit" p1="MJ" p2="GJ" val={settings.energyUnit} set={v => handleChange("energyUnit", v)} />
        </SettingsCard>

        {/* C. Emission Factors */}
        <SettingsCard title="Emission Factors">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                 <label style={labelTheme}>Use Custom Factors?</label>
                 <Toggle val={settings.useCustomFactors} set={v => handleChange("useCustomFactors", v)} />
            </div>
            <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #cbd5e1" }}>
               <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13, background: isDark ? "#1e293b" : "#fff" }}>
                   <thead style={{ background: isDark ? "#0f172a" : "#f1f5f9" }}>
                      <tr><th style={th}>Source</th><th style={th}>Value</th><th style={th}>Unit</th></tr>
                   </thead>
                   <tbody>
                      <tr>
                        <td style={td}>Grid E.F.</td>
                        <td style={td}><input type="number" step="0.01" disabled={!settings.useCustomFactors} value={settings.gridFactor} onChange={e => handleChange("gridFactor", parseFloat(e.target.value))} style={{...inputTheme, padding: 4, width: 60}} /></td>
                        <td style={td}>kg/kWh</td>
                      </tr>
                      {settings.fuelFactors.map(f => (
                         <tr key={f.id}>
                            <td style={td}>{f.name}</td>
                            <td style={td}><input type="number" step="0.01" disabled={!settings.useCustomFactors} value={f.val} onChange={e => handleFactorChange(f.id, parseFloat(e.target.value))} style={{...inputTheme, padding: 4, width: 60}} /></td>
                            <td style={td}>{f.unit}</td>
                         </tr>
                      ))}
                   </tbody>
               </table>
            </div>
        </SettingsCard>

        {/* D. Energy & Fuel Classification */}
        <SettingsCard title="Energy & Fuel Classification">
            <p style={{...labelTheme, marginBottom: 12}}>Mark fuels as Green (Renewable) vs Fossil</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {settings.fuelFactors.map(f => {
                    const isGreen = settings.greenFuels.includes(f.id);
                    return (
                        <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 8, border: "1px solid", borderColor: isDark ? "#334155" : "#e2e8f0" }}>
                            <span style={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#334155" }}>{f.name}</span>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => handleFuelClassToggle(f.id)} style={{...tagBtn, opacity: !isGreen?1:0.4, background: !isGreen ? (isDark ? "#334155":"#e2e8f0"):"transparent"}}>Fossil</button>
                                <button onClick={() => handleFuelClassToggle(f.id)} style={{...tagBtn, opacity: isGreen?1:0.4, background: isGreen ? "#10b981":"transparent", color: isGreen?"#fff":""}}>Green</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </SettingsCard>

        {/* E & F. Dashboard and Chart Config */}
        <SettingsCard title="Dashboard & Analytics Views">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
               <FieldGroup label="Default Chart Count">
                  <input type="number" value={settings.chartCount} onChange={e => handleChange("chartCount", parseInt(e.target.value))} style={inputTheme} min={1} max={8} />
               </FieldGroup>
               <FieldGroup label="Chart Brand Color">
                  <select value={settings.chartBrand} onChange={e => handleChange("chartBrand", e.target.value)} style={inputTheme}>
                      <option>Teal</option>
                      <option>Blue</option>
                      <option>Green</option>
                      <option>Amber</option>
                  </select>
               </FieldGroup>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, marginTop: 16 }}>
                <span style={labelTheme}>Show Data Labels</span>
                <Toggle val={settings.showLabels} set={v => handleChange("showLabels", v)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={labelTheme}>Show Chart Legends</span>
                <Toggle val={settings.showLegends} set={v => handleChange("showLegends", v)} />
            </div>
        </SettingsCard>

        {/* G. Report Settings */}
        <SettingsCard title="Report Layout Settings">
             <ToggleSwitch label="Default Export Format" p1="PDF" p2="Excel" val={settings.reportFormat} set={v => handleChange("reportFormat", v)} />
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, marginTop: 16 }}>
                <span style={labelTheme}>Include Calculation Methodology</span>
                <Toggle val={settings.reportMethodology} set={v => handleChange("reportMethodology", v)} />
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={labelTheme}>Include Raw Emission Factors</span>
                <Toggle val={settings.reportFactors} set={v => handleChange("reportFactors", v)} />
             </div>
             <FieldGroup label="Company Logo">
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                     <div style={{ width: 40, height: 40, background: isDark ? "#334155" : "#e2e8f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                         <FiUpload color="#64748b" />
                     </div>
                     <button style={{ background: "transparent", border: "1px solid #14b8a6", color: "#14b8a6", padding: "6px 12px", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>Upload Logo</button>
                 </div>
             </FieldGroup>
        </SettingsCard>

        {/* I. Notifications & Alerts */}
        <SettingsCard title="Notifications & Alerts">
             
             <div style={{ padding: 16, border: "1px solid", borderColor: isDark ? "#334155" : "#e2e8f0", borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{fontWeight: 700}}>Carbon Threshold Alert</span>
                      <Toggle val={settings.alertEmission} set={v => handleChange("alertEmission", v)} />
                  </div>
                  {settings.alertEmission && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={labelTheme}>Threshold (MT):</span>
                          <input type="number" value={settings.alertEmissionThreshold} onChange={e => handleChange("alertEmissionThreshold", parseInt(e.target.value))} style={{...inputTheme, width: 100, padding: 6}} />
                      </div>
                  )}
             </div>

             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, padding: "0 8px" }}>
                <span style={{fontWeight: 600}}>Renewable Energy Dip Alert</span>
                <Toggle val={settings.alertRenewable} set={v => handleChange("alertRenewable", v)} />
             </div>
             
             <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
                <span style={{fontWeight: 600}}>Carbon Intensity Spike Alert</span>
                <Toggle val={settings.alertIntensity} set={v => handleChange("alertIntensity", v)} />
             </div>

        </SettingsCard>

        {/* H & J Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* H. Data Management */}
          <SettingsCard title="Data Management">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{fontWeight: 700}}>Lock Submitted Months</span>
                      <span style={{fontSize: 12, color: "#64748b"}}>Prevent retrospective inputs</span>
                  </div>
                  <Toggle val={settings.lockMonths} set={v => handleChange("lockMonths", v)} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <ActionBtn icon={<FiUpload/>} label="Import CSV" />
                  <ActionBtn icon={<FiDownload/>} label="Export DB" />
              </div>
              <button style={{ width: "100%", background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5", padding: "10px", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <FiTrash2 /> Reset All Historical Data
              </button>
          </SettingsCard>

          {/* J. System & About */}
          <SettingsCard title="System & About">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <KRow label="App Version" val="v2.1.0-stable" />
                  <KRow label="Database Engine" val="MongoDB 6.0" />
                  <hr style={{ border: "none", borderTop: "1px solid", borderColor: isDark ? "#334155" : "#e2e8f0" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <span style={labelTheme}>Standards & Methodology</span>
                      <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ background: isDark?"#0f172a":"#f1f5f9", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, border: "1px solid", borderColor: isDark?"#334155":"#cbd5e1" }}>GHG Protocol Compliant</span>
                          <span style={{ background: isDark?"#0f172a":"#f1f5f9", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, border: "1px solid", borderColor: isDark?"#334155":"#cbd5e1" }}>ISO 14064</span>
                      </div>
                  </div>
              </div>
          </SettingsCard>
        </div>

      </div>

      {/* STICKY BOTTOM RIBBON */}
      <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px 40px", 
          background: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)", 
          backdropFilter: "blur(12px)", borderTop: "1px solid", borderColor: isDark ? "#334155" : "#e2e8f0",
          display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100
      }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               <FiInfo color="#64748b" size={24} />
               <span style={{ fontWeight: 500, color: isDark ? "#94a3b8" : "#64748b" }}>Some settings may require a hard refresh to take effect globally.</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
              <button disabled={isSaving} onClick={handleReset} style={{ background: "transparent", color: isDark?"#94a3b8":"#475569", border: "1px solid", borderColor: isDark?"#475569":"#cbd5e1", padding: "12px 24px", borderRadius: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <FiRefreshCw /> Reset Defaults
              </button>
              <button disabled={isSaving} onClick={handleSave} style={{ background: "linear-gradient(135deg, #0d9488, #14b8a6)", color: "white", border: "none", padding: "12px 32px", borderRadius: 10, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 15px rgba(20, 184, 166, 0.4)", opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? <span className="spin">⟳</span> : <FiSave />} {isSaving ? "Saving..." : "Save Changes"}
              </button>
          </div>
      </div>

      {/* TOAST SYSTEM */}
      {toast && (
          <div style={{ position: "fixed", top: 40, right: 40, zIndex: 200, background: "#10b981", color: "#fff", padding: "16px 24px", borderRadius: 12, fontWeight: 700, boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)", display: "flex", alignItems: "center", gap: 12, animation: "slideIn 0.3s ease-out" }}>
              <FiCheck size={20} /> {toast}
          </div>
      )}
      <style>{`
          @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .spin { display: inline-block; animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ------ UI COMPONENTS ------

function SettingsCard({ title, children }) {
    return (
        <div className="settings-card" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", padding: 28, borderRadius: 16, border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 20px rgba(0,0,0,0.03)", transition: "transform 0.2s", display: "flex", flexDirection: "column" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>
                <div style={{ width: 8, height: 24, background: "#14b8a6", borderRadius: 4 }}></div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{title}</h3>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {children}
            </div>
        </div>
    );
}

function FieldGroup({ label, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={labelTheme}>{label}</span>
            {children}
        </div>
    );
}

const inputTheme = { width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff", color: "#1e293b" };
const labelTheme = { fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 };

function ToggleSwitch({ label, p1, p2, val, set }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={labelTheme}>{label}</span>
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 4, width: "fit-content" }}>
               <button onClick={() => set(p1)} style={{ padding: "8px 24px", borderRadius: 6, border: "none", fontWeight: 700, cursor: "pointer", background: val===p1?"#14b8a6":"transparent", color: val===p1?"#fff":"#64748b", transition: "0.2s" }}>{p1}</button>
               <button onClick={() => set(p2)} style={{ padding: "8px 24px", borderRadius: 6, border: "none", fontWeight: 700, cursor: "pointer", background: val===p2?"#14b8a6":"transparent", color: val===p2?"#fff":"#64748b", transition: "0.2s" }}>{p2}</button>
            </div>
        </div>
    )
}

function Toggle({ val, set }) {
    return (
        <div onClick={() => set(!val)} style={{ width: 44, height: 24, background: val ? "#10b981" : "#cbd5e1", borderRadius: 12, position: "relative", cursor: "pointer", transition: "0.3s" }}>
            <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: val ? 22 : 2, transition: "0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
        </div>
    )
}

const th = { padding: "8px 12px", borderBottom: "2px solid #e2e8f0" };
const td = { padding: "8px 12px", borderBottom: "1px solid #e2e8f0" };
const tagBtn = { border: "none", padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer" };

function ActionBtn({ icon, label }) {
    return <button style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #cbd5e1", color: "#475569", borderRadius: 8, fontWeight: 700, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, cursor: "pointer" }}>{icon} {label}</button>
}

const KRow = ({ label, val }) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
        <span style={{ color: "#64748b" }}>{label}</span>
        <span>{val}</span>
    </div>
);
