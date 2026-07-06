import React, { useEffect, useState, useRef, memo } from "react";
import { useParams } from "react-router-dom";
import ApexCharts from "apexcharts";

/* ---------- chart types ---------- */
const chartTypes = ["bar", "line", "area", "pie", "donut"];
const chartCardGradient = "linear-gradient(135deg,#f8fafc,#eef2f7)";
const dropdownStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#f3f4f6",
  color: "#000",
  fontSize: 14,
  minWidth: 150
};

/* ---------- KPI CARD ---------- */
const gradients = [
  "linear-gradient(135deg,#ccfbf1,#99f6e4)",
  "linear-gradient(135deg,#ccfbf1,#99f6e4)",
  "linear-gradient(135deg,#ccfbf1,#99f6e4)",
  "linear-gradient(135deg,#e0f2fe,#bae6fd)",
  "linear-gradient(135deg,#e0f2fe,#bae6fd)",
  "linear-gradient(135deg,#e0f2fe,#bae6fd)"
];

const KpiCard = ({ title, value, index }) => (
  <div style={{
    background: gradients[index],
    padding: 26,
    borderRadius: 16,
    textAlign: "center",
    boxShadow: "0 10px 20px rgba(0,0,0,0.12)"
  }}>
    <h4 style={{
      fontSize: 24,
      color: "#065f46",
      marginBottom: 10,
      fontWeight: 700
    }}>{title}</h4>
    <p style={{
      fontSize: 36,
      fontWeight: 900,
      color: "#064e3b"
    }}>{value ?? 0}</p>
  </div>
);

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

const buildAdvancedSeries = (flat, type) => {
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
        try { instance.current.destroy(); } catch(e) {}
        instance.current = null;
    }

    const common = {
      chart: { type: chart.type, height: 320, toolbar: { show: false } },
      tooltip: { enabled: true, shared: false, intersect: true },
      dataLabels: { enabled: true }
    };

    let options;
    if (isPie) {
      options = { ...common, series: pieDataset.values, labels: pieDataset.labels, legend: { position: "bottom" } };
    } else {
      options = {
        ...common,
        series: buildAdvancedSeries(flat, chart.type),
        xaxis: { categories: Object.keys(flat) }
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
            try { instance.current.destroy(); } catch(e) {}
            instance.current = null;
        }
    };
  }, [chart.type, chart.source, JSON.stringify(flat), hasData]);

  return (
    <div style={{
      background: chartCardGradient,
      padding: 20,
      borderRadius: 14,
      boxShadow: "0 6px 14px rgba(0,0,0,0.08)"
    }}>
      <div style={{ marginBottom: 12 }}>
        <select
          style={dropdownStyle}
          value={chart.type}
          onChange={e => updateChart(index, "type", e.target.value)}
        >
          {chartTypes.map(t => <option key={t}>{t}</option>)}
        </select>

        {isPie && (
          <select
            style={{ ...dropdownStyle, marginTop: 8 }}
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
            <h3 style={{ margin: 0, color: "#64748b", fontSize: 18 }}>Data not available for selected time period.</h3>
            <p style={{ margin: "8px 0 0 0", color: "#94a3b8", fontSize: 14 }}>Try selecting a different year, month, or plant.</p>
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
            fetch(`http://localhost:5000/api/carbon/dashboard/${plant}/${m}/${year}`)
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
        try { instance.current.destroy(); } catch(e) {}
        instance.current = null;
    }

    const options = {
      chart: { type: 'area', height: 400, toolbar: { show: false } },
      colors: ['#0f768e'],
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
            borderColor: '#FF4560',
            strokeDashArray: 4,
            borderWidth: 2,
            label: {
              borderColor: '#FF4560',
              style: {
                color: '#fff',
                background: '#FF4560'
              },
              text: `Baseline (Avg 3 Months): ${chartData.baseline.toFixed(2)}`
            }
          }
        ]
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] }
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
            try { instance.current.destroy(); } catch(e) {}
            instance.current = null;
        }
    };
  }, [loading, chartData]);

  return (
    <div style={{
      background: "white", padding: 24, borderRadius: 16,
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)", marginTop: 20
    }}>
      <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: 24 }}>Monthly Carbon Intensity Trend</h3>
      {loading ? (
        <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: 18, color: "#64748b" }}>Loading yearly trend...</p>
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

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Insights Crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
         <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <h2 style={{color:"#dc2626"}}>Rendering Visualization Error</h2>
            <p>An unexpected data anomaly occurred preventing graphs from loading.</p>
            <button onClick={() => window.location.reload()} style={{
                padding: "10px 20px", marginTop: 20, background: "#14b8a6", 
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
    setDataLoading(true);
    fetch(`http://localhost:5000/api/carbon/dashboard/${plant}/${month + 1}/${year}`)
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
    background: "#14b8a6", color: "#fff", border: "none", borderRadius: 8,
    width: 36, height: 36, cursor: "pointer", fontSize: 16
  };

  const kpis = safeData.kpis;

  const isValidDataset = data && data.inputs && data.kpis && Object.keys(data.inputs).length > 0;

  return (
    <AdminPlantErrorBoundary>
    <div style={{ padding: "0 20px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: "#0f768e", margin: 0 }}>
            {plant} Insights
          </h1>
          <p style={{ margin: "8px 0 0 0", color: "#134e4a", fontSize: 18 }}>
            Comprehensive analysis and KPIs for {plant}.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowCal(v => !v)}
            style={{
              fontSize: 20, padding: "12px 20px", borderRadius: 12, border: "none",
              background: "#14b8a6", color: "#fff", cursor: "pointer", fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(20,184,166,0.3)"
            }}
          >
            📅 Select Month
          </button>

          {showCal && (
            <div style={{
              position: "absolute", top: 60, right: 0, background: "#fff",
              borderRadius: 12, padding: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 10
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <button onClick={() => setYear(y => y - 1)} style={arrowStyle}>{"<"}</button>
                <b style={{ color: "#14b8a6", fontSize: 18, alignSelf: "center" }}>{year}</b>
                <button onClick={() => setYear(y => y + 1)} style={arrowStyle}>{">"}</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <button
                    key={m}
                    onClick={() => { setMonth(i); setShowCal(false); }}
                    style={{
                      padding: 10, borderRadius: 8, border: "1px solid #14b8a6",
                      background: i === month ? "#14b8a6" : "#fff",
                      color: i === month ? "#fff" : "#14b8a6",
                      cursor: "pointer", fontWeight: "bold"
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
          height: 400, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", 
          textAlign: "center", background: "#f8fafc", borderRadius: 16, border: "2px dashed #cbd5e1", marginTop: 40 
        }}>
           <h2 style={{ margin: "0 0 10px 0", color: "#475569", fontSize: 24 }}>Data is not available for the selected time period.</h2>
           <p style={{ margin: 0, color: "#94a3b8", fontSize: 16 }}>Try selecting a different year, month, or plant.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, marginBottom: 40, opacity: dataLoading ? 0.6 : 1, transition: "0.3s"
          }}>
            {dataLoading ? (
                <div style={{ gridColumn: "span 3", textAlign: "center", padding: "40px", color: "#64748b" }}>
                    <h3>Loading Metrics...</h3>
                </div>
            ) : (
                <>
                    <KpiCard index={0} title="Total RE %" value={kpis.renewablePercent} />
                    <KpiCard index={1} title="Total Green Fuel %" value={kpis.greenFuelPercent} />
                    <KpiCard index={2} title="Energy Usage Ratio" value={kpis.energyRatio} />
                    <KpiCard index={3} title="Carbon Footprint (MT)" value={kpis.totalCarbonMT} />
                    <KpiCard index={4} title="Carbon Intensity" value={kpis.carbonIntensity} />
                    <KpiCard index={5} title="Total Energy (MJ)" value={kpis.totalEnergyMJ} />
                </>
            )}
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: "20px", opacity: dataLoading ? 0.6 : 1
          }}>
            {charts.map((chart, i) => (
              <ChartCard key={i} chart={chart} index={i} inputs={safeData.inputs} updateChart={updateChart} />
            ))}
          </div>

          <div style={{ opacity: dataLoading ? 0.6 : 1 }}>
             <YearlyTrendChart plant={plant} year={year} />
          </div>
        </>
      )}

    </div>
    </AdminPlantErrorBoundary>
  );
}
