import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, LabelList, ReferenceLine
} from "recharts";
import { 
  FiCalendar, FiChevronLeft, FiChevronRight, 
  FiActivity, FiZap, FiTarget, FiSun, FiSettings, FiAlertCircle, FiCheckCircle, FiLoader,
  FiTrendingUp, FiPieChart, FiArrowUpRight
} from "react-icons/fi";
import { FaRegLightbulb } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL;
const EMISSION_ALERT_THRESHOLD = 2500;

export default function AnalyticsPage() {
  const currentPlant = localStorage.getItem("plant");

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [showCal, setShowCal] = useState(false);

  // States
  const [loading, setLoading] = useState(true);
  const [loadingYearly, setLoadingYearly] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Chart 1 specific state
  const [yearlyData, setYearlyData] = useState({ data: [], baseline: 0 });

  // 1. Fetch Month Specific Data
  const fetchMonthData = async () => {
    if (!currentPlant) return;
    setLoading(true);
    const m = monthIndex + 1; // 1-indexed for backend

    try {
      const res = await fetch(`${API_BASE}/api/carbon/dashboard/${currentPlant}/${m}/${year}`);
      const data = res.ok ? await res.json() : null;
      setDashboardData(data && !data.error ? data : null);
    } catch (error) {
      console.error("Failed fetching monthly data: ", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Full Year Trend (Identical to Admin Insights logic)
  const fetchYearlyTrend = async () => {
    if (!currentPlant) return;
    setLoadingYearly(true);
    
    try {
      const promises = [];
      for (let m = 1; m <= 12; m++) {
        promises.push(
          fetch(`${API_BASE}/api/carbon/dashboard/${currentPlant}/${m}/${year}`)
            .then(res => res.json())
            .catch(() => null)
        );
      }

      const results = await Promise.all(promises);
      const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const chartRows = [];
      const intensities = [];

      results.forEach((d, i) => {
        const val = d?.kpis?.carbonIntensity ? parseFloat(d.kpis.carbonIntensity) : 0;
        chartRows.push({ name: monthsStr[i], intensity: val });
        intensities.push(val);
      });

      // Calculate baseline: average of first 3 non-zero months
      const nonZero = intensities.filter(v => v > 0);
      const first3 = nonZero.slice(0, 3);
      const baselineValue = first3.length > 0
        ? first3.reduce((a, b) => a + b, 0) / first3.length
        : 0;

      setYearlyData({ data: chartRows, baseline: baselineValue });
    } catch (error) {
      console.error("Failed fetching yearly trend: ", error);
    } finally {
      setLoadingYearly(false);
    }
  };

  // Run fetch hooks
  useEffect(() => {
    fetchMonthData();
  }, [currentPlant, year, monthIndex]);

  useEffect(() => {
    // Only refetch yearly trend if year or plant changes
    fetchYearlyTrend();
  }, [currentPlant, year]);

  if (!currentPlant) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e0f2fe, #ccfbf1, #dcfce7)" }}>
        <h2 style={{ color: "#0f766e" }}>Please select a plant from the dashboard.</h2>
      </div>
    );
  }

  // --- Data prep ---
  const inputs = dashboardData?.inputs || {};
  const kpis = dashboardData?.kpis || {};
  const power = inputs.powerConsumption || {};
  const fuel = inputs.fuelConsumption || {};

  const totalYield = inputs.beverageProduction || 0;
  const totalEnergy = kpis.totalEnergyMJ || 0;
  
  // Using correct backend response KPI keys mapped
  const totalEmissions = kpis.totalCarbonMT ? parseFloat(kpis.totalCarbonMT) : 0;
  const carbonIntensity = kpis.carbonIntensity ? parseFloat(kpis.carbonIntensity) : 0;
  
  const totalPowerKWh = (power.gridPowerKWh || 0) + (power.renewablePowerKWh || 0) + (power.solarPowerKWh || 0);
  const renewableRatio = totalPowerKWh ? (((power.renewablePowerKWh || 0) + (power.solarPowerKWh || 0)) / totalPowerKWh) * 100 : 0;
  const energyRatioVal = kpis.energyRatio || (totalYield ? (totalEnergy / totalYield).toFixed(2) : 0);

  const isAlert = totalEmissions > EMISSION_ALERT_THRESHOLD;

  // --- KPI Alternative Logic ---
  const EmissionsCard = totalEmissions > 0 
    ? <KpiCard title="Total Emissions" value={totalEmissions.toLocaleString()} unit="MT CO₂" icon={<FiActivity/>} />
    : <KpiCard title="Total Production Output" value={totalYield.toLocaleString()} unit="L" icon={<FiActivity/>} />;

  const IntensityCard = carbonIntensity > 0
    ? <KpiCard title="Carbon Intensity" value={carbonIntensity} unit="kg CO₂/L" icon={<FiTarget/>} />
    : <KpiCard title="Avg Energy / Day (est)" value={totalEnergy > 0 ? (totalEnergy / 30).toFixed(0) : 0} unit="MJ/Day" icon={<FiTarget/>} />;


  // --- Chart 2: Energy Consumption Analysis ---
  const energyBarData = [
    { name: "Grid Electricity", value: power.gridPowerKWh || 0 },
    { name: "Renewable Power", value: power.renewablePowerKWh || 0 },
    { name: "Solar Power", value: power.solarPowerKWh || 0 },
    { name: "Diesel (HSD)", value: fuel.hsdLitre || 0 },
    { name: "Furnace", value: fuel.furnaceOilLitre || 0 },
    { name: "PNG", value: fuel.pngSCM || fuel.pngScm || 0 },
    { name: "LPG", value: fuel.lpgKg || 0 },
    { name: "Biomass", value: fuel.biomassMJ || fuel.biomassMj || 0 }
  ];
  const filteredEnergyBarData = energyBarData.filter(d => d.value > 0);
  let highestEnergySrc = "N/A";
  if (filteredEnergyBarData.length > 0) {
    const highest = filteredEnergyBarData.reduce((max, obj) => obj.value > max.value ? obj : max, filteredEnergyBarData[0]);
    highestEnergySrc = highest.name;
  }

  // --- Chart 3: Source Contribution Breakdown ---
  const gridEms = ((power.gridPowerKWh || 0) * 0.82) / 1000;
  const foEms = ((fuel.furnaceOilLitre || 0) * 2.68) / 1000;
  const hsdEms = ((fuel.hsdLitre || 0) * 2.68) / 1000;
  const lpgEms = ((fuel.lpgKg || 0) * 2.98) / 1000;
  const pngEms = ((fuel.pngSCM || fuel.pngScm || 0) * 2.02) / 1000;
  const bioEms = ((fuel.biomassMJ || fuel.biomassMj || 0) * 0.05) / 1000;

  const sources = [
    { name: "Grid Electricity", emissions: gridEms },
    { name: "Furnace Oil", emissions: foEms },
    { name: "Diesel (HSD)", emissions: hsdEms },
    { name: "LPG", emissions: lpgEms },
    { name: "PNG (Gas)", emissions: pngEms },
    { name: "Biomass", emissions: bioEms }
  ];
  sources.sort((a,b) => b.emissions - a.emissions);
  const chart3Data = sources.filter(s => s.emissions > 0).map(s => ({...s, emissions: parseFloat(s.emissions.toFixed(3))}));
  const totalSourceEms = chart3Data.reduce((sum, item) => sum + item.emissions, 0);
  const highestContributor = chart3Data.length > 0 ? chart3Data[0] : null;
  const highestContributorPercent = (highestContributor && totalSourceEms) ? ((highestContributor.emissions / totalSourceEms) * 100).toFixed(1) : 0;

  const arrowStyle = { background: "#14b8a6", color: "#fff", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };

  return (
    <div style={{
      background: "linear-gradient(135deg, #e0f2fe, #ccfbf1, #dcfce7)",
      minHeight: "100vh",
      padding: "32px 40px",
      fontFamily: "'Inter', sans-serif",
      color: "#0f172a"
    }}>
      {/* 1. Header Section - Centered */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 32, position: "relative" }}>
        
        {/* Month Selector Absolute positioned so header stays pure center horizontally */}
        <div style={{ position: "absolute", top: 0, right: 0, zIndex: 60 }}>
          <button 
            onClick={() => setShowCal(v => !v)} 
            style={{ 
              display: "flex", gap: 10, alignItems: "center", fontSize: 16, padding: "12px 20px", 
              borderRadius: 12, border: "none", background: "#ffffff", color: "#0f766e", 
              cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", fontWeight: 600
            }}
          >
            <FiCalendar size={18} color="#14b8a6" /> {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][monthIndex]} {year}
          </button>
          
          {showCal && (
            <div style={{ position: "absolute", top: 55, right: 0, background: "rgba(255,255,255,0.98)", backdropFilter: "blur(8px)", borderRadius: 12, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", width: 260, border: "1px solid #ccfbf1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
                <button onClick={() => setYear(y => y - 1)} style={arrowStyle}><FiChevronLeft/></button>
                <b style={{ color: "#0f766e", fontSize: 18 }}>{year}</b>
                <button onClick={() => setYear(y => y + 1)} style={arrowStyle}><FiChevronRight/></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <button key={m} onClick={() => { setMonthIndex(i); setShowCal(false); }} 
                    style={{ 
                      padding: "8px 0", borderRadius: 8, border: "none", 
                      background: i === monthIndex ? "#14b8a6" : "transparent", 
                      color: i === monthIndex ? "#fff" : "#475569", 
                      cursor: "pointer", fontSize: 13, fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >{m}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <h1 style={{ color: "#0f766e", margin: 0, fontSize: 36, fontWeight: 900, textShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          Analytics Overview
        </h1>
        <p style={{ margin: "10px 0 0 0", color: "#475569", fontSize: 18, fontWeight: 500 }}>
          Deep dive into production and energy insights.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* KPI CARDS */}
        {loading ? (
             <Placeholder loader="Loading metrics for selected month..." height={100} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {EmissionsCard}
            <KpiCard title="Total Energy" value={totalEnergy.toLocaleString()} unit="MJ" icon={<FiZap/>} />
            {IntensityCard}
            <KpiCard title="Renewable Energy" value={renewableRatio.toFixed(1)} unit="%" icon={<FiSun/>} />
            <KpiCard title="Energy Ratio" value={energyRatioVal} unit="MJ/L" icon={<FiSettings/>} />
            <KpiCard 
              title="System Status" 
              value={isAlert ? "ALERT" : "NORMAL"} 
              unit="" 
              icon={isAlert ? <FiAlertCircle/> : <FiCheckCircle/>} 
              isStatus 
              statusColor={isAlert ? "#ef4444" : "#10b981"} 
              threshold={EMISSION_ALERT_THRESHOLD}
            />
          </div>
        )}

        {/* Chart 1: Monthly Carbon Trend (Full year) */}
        <ChartCard title={<span><FiTrendingUp style={{ marginRight: 10, verticalAlign: "bottom", color: "#14b8a6" }} /> Monthly Carbon Intensity Trend</span>}>
          {loadingYearly ? (
            <Placeholder loader="Fetching yearly trends..." height={320} />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={yearlyData.data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecfdf5" />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }} />
                  {yearlyData.baseline > 0 && (
                    <ReferenceLine 
                      y={yearlyData.baseline} 
                      stroke="#ef4444" 
                      strokeDasharray="4 4" 
                      label={{ 
                        position: 'insideTopLeft', 
                        value: `Baseline: ${yearlyData.baseline.toFixed(2)}`, 
                        fill: '#ef4444', 
                        fontSize: 13, 
                        fontWeight: 700,
                        fontStyle: 'italic',
                        offset: 6
                      }} 
                    />
                  )}
                  <Area type="monotone" dataKey="intensity" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorIntensity)" activeDot={{ r: 8 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ background: "#f0fdfa", borderLeft: "4px solid #14b8a6", padding: "12px 16px", borderRadius: 8, marginTop: 16, fontSize: 14, color: "#334155" }}>
                <strong>Insight:</strong> Traces the full year intensity fluctuation ensuring continuous visibility against the baseline.
              </div>
            </>
          )}
        </ChartCard>

        {loading ? (
             <Placeholder loader="Rendering energy data..." height={350} />
        ) : (
          <ChartCard title={<span><FiZap style={{ marginRight: 10, verticalAlign: "bottom", color: "#eab308" }} /> Energy Consumption Analysis</span>}>
            {filteredEnergyBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={filteredEnergyBarData} margin={{ top: 30, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecfdf5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: "rgba(16,185,129,0.05)" }} contentStyle={{ borderRadius: 12, border: "none" }} />
                  <Bar dataKey="value" fill="#14b8a6" radius={[4,4,0,0]} barSize={50}>
                    <LabelList dataKey="value" position="top" fill="#0f766e" fontSize={12} formatter={(val) => val.toLocaleString()} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>No valid energy data for this month. Try a different selection.</div>
            )}
            <div style={{ background: "#f0fdf4", borderLeft: "4px solid #22c55e", padding: "12px 16px", borderRadius: 8, marginTop: 16, fontSize: 14, color: "#334155" }}>
              <strong>Insight:</strong> For the selected month, consumption in nominal units was highest in <strong>{highestEnergySrc}</strong>.
            </div>
          </ChartCard>
        )}

        {loading ? (
             <Placeholder loader="Calculating source hotstops..." height={350} />
        ) : (
          <ChartCard title={<span><FiPieChart style={{ marginRight: 10, verticalAlign: "bottom", color: "#f97316" }} /> Source Contributors to Total Emissions</span>}>
            {chart3Data.length > 0 ? (
              <div style={{ position: "relative" }}>
                 {highestContributor && (
                    <div style={{ position: "absolute", right: 20, top: 0, zIndex: 10, background: "rgba(255,255,255,0.95)", border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: 8, boxShadow: "0 4px 6px rgba(0,0,0,0.05)", fontSize: 13, color: "#334155" }}>
                        👉 <strong>Highest Contributor:</strong> {highestContributor.name} ({highestContributorPercent}%)
                    </div>
                 )}
                 <ResponsiveContainer width="100%" height={320}>
                    <BarChart layout="vertical" data={chart3Data} margin={{ top: 40, right: 40, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#ecfdf5" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} label={{ value: 'MT CO₂', position: 'insideBottomRight', offset: 0, fontSize: 12, fill: "#64748b" }}/>
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 13, fill: "#334155", fontWeight: 600 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: "rgba(16,185,129,0.05)" }} contentStyle={{ borderRadius: 12, border: "none" }} />
                      <Bar dataKey="emissions" fill="#f59e0b" barSize={32} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="emissions" position="right" fill="#b45309" fontSize={13} formatter={(val) => `${val} MT`} />
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>No significant source contributors found for this period.</div>
            )}
             <div style={{ background: "#fffbeb", borderLeft: "4px solid #f59e0b", padding: "12px 16px", borderRadius: 8, marginTop: 16, fontSize: 14, color: "#334155" }}>
                <strong>Insight:</strong> <strong>{highestContributor?.name || "Active source"}</strong> contributes the most to emissions ({highestContributorPercent}% of tracked footprint) for this period.
             </div>
          </ChartCard>
        )}

        {/* Restore Section: AI Reduction Insights */}
        <div style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", borderRadius: 16, padding: 32, border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <FaRegLightbulb size={24} color="#0ea5e9" />
            <div style={{ color: "#0f172a", fontWeight: 800, fontSize: 20 }}>
              Reduction Opportunity Insights
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <InsightCard icon={<FiArrowUpRight color="#14b8a6" />} text="Increase solar usage by 10% to reduce emissions significantly based on this month's grid usage." />
            <InsightCard icon={<FiArrowUpRight color="#14b8a6" />} text="Optimize grid consumption during peak hours (18:00 - 22:00) to cut carbon costs." />
            <InsightCard icon={<FiArrowUpRight color="#14b8a6" />} text={`Reducing ${highestContributor?.name || "main"} dependency can dramatically improve your green footprint.`} />
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents
function Placeholder({ loader, height }) {
  return (
    <div style={{ 
      background: "rgba(255, 255, 255, 0.5)", 
      backdropFilter: "blur(12px)", 
      borderRadius: 16, 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center", 
      height: height,
      color: "#0f766e"
    }}>
      <FiLoader className="spin" size={32} style={{ marginBottom: 12, animation: "spin 1s linear infinite" }} />
      <div style={{ fontWeight: 600 }}>{loader}</div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function KpiCard({ title, value, unit, icon, isStatus, statusColor, threshold }) {
  return (
    <div style={{ 
      background: isStatus ? `${statusColor}10` : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(12px)",
      padding: "24px", 
      borderRadius: 16, 
      border: isStatus ? `1px solid ${statusColor}40` : "1px solid rgba(255,255,255,0.8)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.03)", 
      display: "flex", 
      alignItems: "center", 
      gap: 20
    }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: isStatus ? statusColor : "linear-gradient(135deg, #ccfbf1, #e0f2fe)", display: "flex", alignItems: "center", justifyContent: "center", color: isStatus ? "#fff" : "#0f766e", fontSize: 28, boxShadow: isStatus ? `0 4px 10px ${statusColor}50` : 'none' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h4>
        <div style={{ margin: 0, color: isStatus ? statusColor : "#0f172a", fontSize: 26, fontWeight: 900, marginTop: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
          {value} 
          {unit && <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{unit}</span>}
        </div>
        {isStatus && (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            Threshold: {threshold.toLocaleString()} MT
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ 
      background: "rgba(255, 255, 255, 0.9)", 
      backdropFilter: "blur(12px)", 
      padding: 32, 
      borderRadius: 16, 
      border: "1px solid rgba(255,255,255,0.8)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column"
    }}>
      <h3 style={{ margin: 0, color: "#0f172a", fontSize: 18, fontWeight: 800, marginBottom: 24, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>{title}</h3>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

function InsightCard({ text, icon }) {
  return (
    <div style={{ 
      background: "rgba(255, 255, 255, 0.9)", 
      padding: "16px 20px", 
      borderRadius: 12,
      borderLeft: "5px solid #14b8a6",
      boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      fontSize: 15,
      color: "#1e293b",
      lineHeight: 1.5,
      fontWeight: 500,
      display: "flex",
      alignItems: "flex-start",
      gap: 12
    }}>
      <div style={{ marginTop: 2 }}>{icon}</div>
      <div>{text}</div>
    </div>
  );
}