import React, { useEffect, useState, useRef, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, FiCalendar, FiChevronLeft, FiChevronRight,
  FiZap, FiSun, FiActivity, FiTarget, FiLoader, FiShield, FiSliders
} from "react-icons/fi";
import { FaLeaf, FaChartLine } from "react-icons/fa";
import ApexCharts from "apexcharts";

const API_BASE = import.meta.env.VITE_API_URL;

/* ---------- chart types ---------- */
const chartTypes = ["bar", "line", "area", "pie", "donut"];
const chartCardGradient = "#ffffff";
const dropdownStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 600,
  minWidth: 120,
  outline: "none",
  cursor: "pointer"
};

/* ---------- KPI CARD ---------- */
const kpiConfigs = [
  { title: "Renewable Mix", icon: <FiSun />, color: "#10b981", bg: "rgba(16,185,129,0.06)", suffix: "%" },
  { title: "Green Fuel Mix", icon: <FaLeaf />, color: "#0f766e", bg: "rgba(15,118,110,0.06)", suffix: "%" },
  { title: "Energy Usage Ratio", icon: <FiZap />, color: "#3b82f6", bg: "rgba(59,130,246,0.06)", suffix: " MJ/L" },
  { title: "Carbon Footprint", icon: <FiActivity />, color: "#ef4444", bg: "rgba(239,68,68,0.06)", suffix: " MT" },
  { title: "Carbon Intensity", icon: <FiTarget />, color: "#f59e0b", bg: "rgba(245,158,11,0.06)", suffix: " kg/L" },
  { title: "Total Energy", icon: <FiShield />, color: "#8b5cf6", bg: "rgba(139,92,246,0.06)", suffix: " MJ" }
];

const KpiCard = ({ value, index }) => {
  const cfg = kpiConfigs[index] || kpiConfigs[0];
  const displayVal = typeof value === "number" ? value.toFixed(value < 1 && value > 0 ? 3 : 1) : value;

  return (
    <div style={{
      background: "white",
      padding: "24px",
      borderRadius: "20px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
      display: "flex",
      alignItems: "center",
      gap: "18px"
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "12px",
        background: cfg.bg,
        color: cfg.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        flexShrink: 0
      }}>
        {cfg.icon}
      </div>
      <div>
        <h4 style={{
          fontSize: "11px",
          color: "#64748b",
          marginBottom: "4px",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>{cfg.title}</h4>
        <p style={{
          fontSize: "20px",
          fontWeight: "900",
          color: "#0f172a",
          margin: 0
        }}>
          {displayVal}{cfg.suffix}
        </p>
      </div>
    </div>
  );
};

/* ---------- DATA HELPERS ---------- */
const flattenInputs = inputs => ({
  grid: inputs?.powerConsumption?.gridPowerKWh ?? 0,
  renewable: inputs?.powerConsumption?.renewablePowerKWh ?? 0,
  solar: inputs?.powerConsumption?.solarPowerKWh ?? 0,
  lpg: inputs?.fuelConsumption?.lpgKg ?? 0,
  furnace: inputs?.fuelConsumption?.furnaceOilLitre ?? 0,
  png: inputs?.fuelConsumption?.pngSCM ?? 0,
  hsd: inputs?.fuelConsumption?.hsdLitre ?? 0,
  biomass: inputs?.fuelConsumption?.biomassMJ ?? 0,
  production: inputs?.beverageProduction ?? 0
});

const buildPieDataset = (flat, source) => {
  const power = {
    labels: ["Grid", "Renewable", "Solar", "Production"],
    values: [flat.grid, flat.renewable, flat.solar, flat.production]
  };
  const fuel = {
    labels: ["LPG", "Furnace", "PNG", "HSD", "Biomass", "Production"],
    values: [flat.lpg, flat.furnace, flat.png, flat.hsd, flat.biomass, flat.production]
  };
  if (source === "Power") return power;
  if (source === "Fuel") return fuel;
  return {
    labels: ["Grid", "Renewable", "Solar", "LPG", "Furnace", "PNG", "HSD", "Biomass", "Production"],
    values: Object.values(flat)
  };
};

const buildAdvancedSeries = (flat) => {
  const values = Object.values(flat);
  return [{ name: "Data", data: values }];
};

/* ---------- CHART CARD ---------- */
const ChartCard = memo(({ chart, index, inputs, updateChart }) => {
  const ref = useRef(null);
  const instance = useRef(null);
  const flat = flattenInputs(inputs);

  const isPie = chart.type === "pie" || chart.type === "donut";

  // Pre-calculate to ensure specific category subset contains real data
  let finalSeriesData = [];
  let pieDataset = null;

  if (isPie) {
      pieDataset = buildPieDataset(flat, chart.source);
      finalSeriesData = pieDataset.values;
  } else {
      finalSeriesData = Object.values(flat);
  }

  const hasData = finalSeriesData.some(v => v > 0);

  useEffect(() => {
    if (!ref.current || !hasData) return;
    if (instance.current) {
        try { instance.current.destroy(); } catch(e) { void e; }
        instance.current = null;
    }

    const common = {
      chart: { 
        type: chart.type, 
        height: 320, 
        toolbar: { show: false },
        fontFamily: "'Inter', sans-serif"
      },
      tooltip: { enabled: true, theme: "light" },
      dataLabels: { enabled: true },
      colors: ["#0f766e", "#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b", "#334155"]
    };

    let options;
    if (isPie) {
      options = { ...common, series: pieDataset.values, labels: pieDataset.labels, legend: { position: "bottom" } };
    } else {
      options = {
        ...common,
        series: buildAdvancedSeries(flat),
        xaxis: { categories: Object.keys(flat) },
        grid: { borderColor: "rgba(226, 232, 240, 0.6)", strokeDasharray: 4 }
      };
    }

    try {
        instance.current = new ApexCharts(ref.current, options);
        instance.current.render();
    } catch(err) {
        console.error("Chart Render Failed", err);
    }

    return () => {
        if (instance.current) {
            try { instance.current.destroy(); } catch(e) { void e; }
            instance.current = null;
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart.type, chart.source, JSON.stringify(flat), hasData]);

  return (
    <div style={{
      background: chartCardGradient,
      padding: 24,
      borderRadius: 20,
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)"
    }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <select
          style={dropdownStyle}
          value={chart.type}
          onChange={e => updateChart(index, "type", e.target.value)}
        >
          {chartTypes.map(t => <option key={t}>{t}</option>)}
        </select>

        {isPie && (
          <select
            style={dropdownStyle}
            value={chart.source}
            onChange={e => updateChart(index, "source", e.target.value)}
          >
            <option>Power</option>
            <option>Fuel</option>
            <option>Both</option>
          </select>
        )}
      </div>

      {!hasData ? (
         <div style={{ height: 320, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: 20 }}>
            <h3 style={{ margin: 0, color: "#64748b", fontSize: 16 }}>Data not available for selected time period.</h3>
            <p style={{ margin: "8px 0 0 0", color: "#94a3b8", fontSize: 13 }}>Try selecting a different year, month, or plant.</p>
         </div>
      ) : (
         <div ref={ref} style={{ height: 320 }} />
      )}
    </div>
  );
});

/* ---------- YEARLY TREND CHART ---------- */
const YearlyTrendChart = memo(({ plant, year }) => {
  const ref = useRef(null);
  const instance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ months: [], intensity: [], baseline: 0 });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchYearData = async () => {
      try {
        const promises = [];
        for (let m = 1; m <= 12; m++) {
          promises.push(
            fetch(`${API_BASE}/api/carbon/dashboard/${plant}/${m}/${year}`)
              .then(res => res.json())
              .catch(() => null)
          );
        }

        const results = await Promise.all(promises);
        if (!isMounted) return;

        const monthlyIntensities = results.map(d => {
          return d?.kpis?.carbonIntensity ? parseFloat(d.kpis.carbonIntensity) : 0;
        });

        // Calculate baseline: average of first 3 non-zero months
        const availableData = monthlyIntensities.filter(v => v > 0);
        const first3 = availableData.slice(0, 3);
        const baselineValue = first3.length > 0
          ? first3.reduce((a, b) => a + b, 0) / first3.length
          : 0;

        setChartData({
          months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          intensity: monthlyIntensities,
          baseline: baselineValue
        });

      } catch (err) {
        console.error("Failed to load yearly trend", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchYearData();
    return () => { isMounted = false; };
  }, [plant, year]);

  useEffect(() => {
    if (loading || !ref.current) return;
    if (instance.current) {
        try { instance.current.destroy(); } catch(e) { void e; }
        instance.current = null;
    }

    const options = {
      chart: { 
        type: 'area', 
        height: 400, 
        toolbar: { show: false },
        fontFamily: "'Inter', sans-serif"
      },
      colors: ['#0f766e'],
      series: [{
        name: 'Carbon Intensity',
        data: chartData.intensity
      }],
      xaxis: {
        categories: chartData.months
      },
      annotations: {
        yaxis: [
          {
            y: chartData.baseline,
            borderColor: '#ef4444',
            strokeDashArray: 4,
            borderWidth: 2,
            label: {
              borderColor: '#ef4444',
              style: {
                color: '#fff',
                background: '#ef4444',
                fontWeight: 700
              },
              text: `Baseline (Avg 3 Months): ${chartData.baseline.toFixed(3)}`
            }
          }
        ]
      },
      grid: { borderColor: "rgba(226, 232, 240, 0.6)", strokeDasharray: 4 },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] }
      }
    };

    try {
        instance.current = new ApexCharts(ref.current, options);
        instance.current.render();
    } catch(err) {
        console.error("YearlyTrend failure", err);
    }

    return () => {
        if (instance.current) {
            try { instance.current.destroy(); } catch(e) { void e; }
            instance.current = null;
        }
    };
  }, [loading, chartData]);

  return (
    <div style={{
      background: "white", padding: 26, borderRadius: 20,
      border: "1px solid rgba(226, 232, 240, 0.8)",
      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)", marginTop: 24
    }}>
      <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: 17, fontWeight: 800 }}>Monthly Carbon Intensity Trend</h3>
      {loading ? (
        <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "#0f766e" }}>
          <FiLoader size={36} style={{ animation: "spin 1s linear infinite" }} />
          <style dangerouslySetInnerHTML={{ __html: "@keyframes spin { 100% { transform: rotate(360deg); } }" }} />
        </div>
      ) : (
        <div ref={ref} style={{ height: 400 }} />
      )}
    </div>
  );
});

/* ---------- ERROR BOUNDARY ---------- */
class AdminPlantErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Insights Crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
         <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <h2 style={{color:"#ef4444"}}>Rendering Visualization Error</h2>
            <p>An unexpected data anomaly occurred preventing graphs from loading.</p>
            <button onClick={() => window.location.reload()} style={{
                padding: "10px 20px", marginTop: 20, background: "#0f766e", 
                color: "#fff", border: "none", borderRadius: 8, cursor: "pointer"
            }}>Reload Dashboard</button>
         </div>
      );
    }
    return this.props.children; 
  }
}

/* ---------- DASHBOARD (Admin Detail) ---------- */
export default function AdminPlantDetail() {
  const { plantId } = useParams();
  const plant = plantId;
  const navigate = useNavigate();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showCal, setShowCal] = useState(false);
  const [data, setData] = useState(null);

  const [charts, setCharts] = useState([
    { type: "bar", source: "Both" },
    { type: "pie", source: "Both" }
  ]);

  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      setDataLoading(true);
    }, 0);
    
    fetch(`${API_BASE}/api/carbon/dashboard/${plant}/${month + 1}/${year}`)
      .then(res => res.json())
      .then(d => {
        if (isMounted) {
            setData(d);
            setDataLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
            setData(null);
            setDataLoading(false);
        }
      });
      
    return () => { isMounted = false; };
  }, [year, month, plant]);

  const safeData = data?.inputs && data?.kpis
    ? data
    : {
      inputs: {},
      kpis: {
        renewablePercent: 0, greenFuelPercent: 0, energyRatio: 0,
        totalCarbonMT: 0, carbonIntensity: 0, totalEnergyMJ: 0
      }
    };

  const updateChart = (i, key, value) => {
    setCharts(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: value };
      return copy;
    });
  };

  const arrowStyle = {
    background: "#0f766e", color: "#fff", border: "none", borderRadius: 8,
    width: 32, height: 32, cursor: "pointer", fontSize: 14, display: "flex",
    alignItems: "center", justifyContent: "center"
  };

  const kpis = safeData.kpis;

  const isValidDataset = data && data.inputs && data.kpis && Object.keys(data.inputs).length > 0;

  return (
    <AdminPlantErrorBoundary>
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* HEADER ROW WITH BACK BUTTON */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <button 
            onClick={() => navigate("/admin/dashboard")} 
            style={{
              background: "white",
              color: "#0f766e",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              padding: "8px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              marginBottom: 14,
              transition: "0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            <FiArrowLeft /> Back to Overview
          </button>
          
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
            {plant} Insights
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#475569", fontSize: 14, fontWeight: 500 }}>
            Comprehensive analysis, carbon cap audits, and energy ratios for {plant} Node.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowCal(v => !v)}
            style={{
              fontSize: 14, padding: "10px 18px", borderRadius: 10, border: "none",
              background: "#0f766e", color: "#fff", cursor: "pointer", fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(15,118,110,0.2)", display: "flex", alignItems: "center", gap: 8
            }}
          >
            <FiCalendar /> Select Month
          </button>

          {showCal && (
            <div style={{
              position: "absolute", top: 48, right: 0, background: "#fff",
              borderRadius: 16, padding: 18, boxShadow: "0 10px 30px rgba(15,23,42,0.1)", zIndex: 10,
              border: "1px solid #e2e8f0", minWidth: 260
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <button onClick={() => setYear(y => y - 1)} style={arrowStyle}><FiChevronLeft/></button>
                <b style={{ color: "#0f766e", fontSize: 16, alignSelf: "center", fontWeight: 800 }}>{year}</b>
                <button onClick={() => setYear(y => y + 1)} style={arrowStyle}><FiChevronRight/></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <button
                    key={m}
                    onClick={() => { setMonth(i); setShowCal(false); }}
                    style={{
                      padding: "8px 0", borderRadius: 8, border: "1px solid #cbd5e1",
                      background: i === month ? "#0f766e" : "#fff",
                      color: i === month ? "#fff" : "#475569",
                      cursor: "pointer", fontWeight: "bold", fontSize: 12
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isValidDataset && !dataLoading ? (
        <div style={{ 
          height: 350, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", 
          textAlign: "center", background: "white", borderRadius: 20, border: "1px dashed #cbd5e1", marginTop: 12, padding: 20
        }}>
           <h2 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: 18, fontWeight: 800 }}>Data not available for the selected period.</h2>
           <p style={{ margin: 0, color: "#64748b", fontSize: 13, fontWeight: 500 }}>Try selecting a different year, month, or plant.</p>
        </div>
      ) : (
        <>
          {/* KPI CARDS GRID */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, opacity: dataLoading ? 0.6 : 1, transition: "0.3s"
          }}>
            {dataLoading ? (
                <div style={{ gridColumn: "span 3", textAlign: "center", padding: "40px", color: "#0f766e" }}>
                    <FiLoader size={36} style={{ animation: "spin 1s linear infinite" }} />
                    <p style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>Loading Metrics...</p>
                </div>
            ) : (
                <>
                    <KpiCard index={0} title="Total RE Mix" value={kpis.renewablePercent} />
                    <KpiCard index={1} title="Green Fuel Mix" value={kpis.greenFuelPercent} />
                    <KpiCard index={2} title="Energy Usage Ratio" value={kpis.energyRatio} />
                    <KpiCard index={3} title="Carbon Footprint" value={kpis.totalCarbonMT} />
                    <KpiCard index={4} title="Carbon Intensity" value={kpis.carbonIntensity} />
                    <KpiCard index={5} title="Total Energy" value={kpis.totalEnergyMJ} />
                </>
            )}
          </div>

          {/* CHARTS GRID */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, opacity: dataLoading ? 0.6 : 1
          }}>
            {charts.map((chart, i) => (
              <ChartCard key={i} chart={chart} index={i} inputs={safeData.inputs} updateChart={updateChart} />
            ))}
          </div>

          {/* YEARLY CHART PANEL */}
          <div style={{ opacity: dataLoading ? 0.6 : 1 }}>
             <YearlyTrendChart plant={plant} year={year} />
          </div>
        </>
      )}

    </div>
    </AdminPlantErrorBoundary>
  );
}
