import { useEffect, useState, useRef, memo } from "react";
import ApexCharts from "apexcharts";
import { 
  FiSun, FiWind, FiSettings, FiActivity, FiTarget, FiZap, 
  FiCpu, FiCheckCircle, FiFileText, FiClock, FiActivity as FiNode, 
  FiCalendar, FiArrowRight 
} from "react-icons/fi";

/* ---------- chart types ---------- */
const chartTypes = [
  "bar","line","area","pie","donut",
  "scatter","bubble","heatmap",
  "treemap","boxPlot"
];

const chartCardGradient = "rgba(255, 255, 255, 0.8)";

const dropdownStyle = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 600,
  minWidth: 130,
  cursor: "pointer",
  outline: "none",
  boxShadow: "0 2px 4px rgba(15, 23, 42, 0.02)"
};

/* ---------- KPI CARD ---------- */
const KpiCard = ({ title, value, index, icon }) => {
  const trends = [
    { label: "+12.4% MoM", isPositive: true, color: "#10b981" },
    { label: "+4.2% MoM", isPositive: true, color: "#10b981" },
    { label: "-2.8% MoM", isPositive: true, color: "#10b981" },
    { label: "-6.4% MoM", isPositive: true, color: "#10b981" },
    { label: "-3.5% MoM", isPositive: true, color: "#10b981" },
    { label: "+1.2% MoM", isPositive: false, color: "#f97316" }
  ];

  const sparklinePaths = [
    "M0,20 L12,12 L24,16 L36,4 L48,10 L60,2",
    "M0,18 L12,14 L24,10 L36,12 L48,6 L60,8",
    "M0,6 L12,8 L24,14 L36,10 L48,16 L60,22",
    "M0,4 L12,8 L24,14 L36,10 L48,18 L60,20",
    "M0,2 L12,10 L24,8 L36,16 L48,12 L60,20",
    "M0,14 L12,16 L24,12 L36,14 L48,10 L60,8"
  ];

  const cardBorders = [
    "5px solid #10b981",
    "5px solid #0f766e",
    "5px solid #0d9488",
    "5px solid #0f172a",
    "5px solid #0284c7",
    "5px solid #f97316"
  ];

  const cardGradients = [
    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,253,250,0.9))",
    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,253,250,0.9))",
    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,253,250,0.9))",
    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(241,245,249,0.9))",
    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,249,255,0.9))",
    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,247,237,0.9))"
  ];

  const currentTrend = trends[index];

  return (
    <div 
      className="kpi-dashboard-card"
      style={{
        background: cardGradients[index],
        padding: "22px 26px",
        borderRadius: 20,
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        borderTop: cardBorders[index],
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          width: 42, height: 42, borderRadius: "12px", background: "rgba(16, 185, 129, 0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: index === 3 ? "#0f172a" : "#0f766e", fontSize: 18, flexShrink: 0,
          boxShadow: "0 2px 6px rgba(16, 185, 129, 0.05)"
        }}>
          {icon}
        </div>

        {/* Mini Sparkline Chart */}
        <svg width="65" height="24" viewBox="0 0 60 24" style={{ opacity: 0.8 }}>
          <path d={sparklinePaths[index]} fill="none" stroke={index === 5 ? "#f97316" : "#10b981"} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ marginTop: "4px" }}>
        <h4 style={{
          fontSize: 11,
          color: "#64748b",
          margin: "0 0 4px 0",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>{title}</h4>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <p style={{
            fontSize: "24px",
            margin: 0,
            fontWeight: 900,
            color: "#0f172a",
            letterSpacing: "-0.5px"
          }}>{value ?? 0}</p>

          <span style={{
            fontSize: "10px",
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: "20px",
            background: currentTrend.isPositive ? "rgba(16, 185, 129, 0.1)" : "rgba(249, 115, 22, 0.1)",
            color: currentTrend.color
          }}>
            {currentTrend.label}
          </span>
        </div>
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

/* ---------- PIE DATA ---------- */
const buildPieDataset = (flat, source) => {
  const power = {
    labels:["Grid","Renewable","Solar","Production"],
    values:[flat.grid,flat.renewable,flat.solar,flat.production]
  };

  const fuel = {
    labels:["LPG","Furnace","PNG","HSD","Biomass","Production"],
    values:[flat.lpg,flat.furnace,flat.png,flat.hsd,flat.biomass,flat.production]
  };

  if(source==="Power") return power;
  if(source==="Fuel") return fuel;

  return {
    labels:[
      "Grid","Renewable","Solar",
      "LPG","Furnace","PNG",
      "HSD","Biomass","Production"
    ],
    values:Object.values(flat)
  };
};

/* ---------- ADVANCED SERIES ---------- */
const buildAdvancedSeries = (flat,type)=>{
  const values = Object.values(flat);
  const labels = Object.keys(flat);

  if(type==="bubble"){
    return [{data:values.map((v,i)=>({x:i,y:v,z:v/10+1}))}];
  }

  if(type==="heatmap"){
    return labels.map((l,i)=>({name:l,data:[{x:l,y:values[i]}]}));
  }

  if(type==="treemap"){
    return [{data:labels.map((l,i)=>({x:l,y:values[i]}))}];
  }

  if(type==="boxPlot"){
    return [{
      data:labels.map((l,i)=>({
        x:l,
        y:[
          values[i]*0.7,
          values[i]*0.9,
          values[i],
          values[i]*1.1,
          values[i]*1.3
        ]
      }))
    }];
  }

  return [{name:"Data",data:values}];
};

/* ---------- CHART CARD ---------- */
const ChartCard = memo(({ chart, index, inputs, updateChart }) => {
  const ref = useRef(null);
  const instance = useRef(null);
  const flat = flattenInputs(inputs);
  const flatString = JSON.stringify(flat);

  useEffect(() => {
    if (!ref.current) return;
    if (instance.current) instance.current.destroy();

    const common = {
      chart: {
        type: chart.type,
        height: 320,
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: { enabled: true, delay: 150 },
          dynamicAnimation: { enabled: false }
        },
        fontFamily: "'Inter', sans-serif"
      },
      colors: ["#10b981", "#0f766e", "#0ea5e9", "#f59e0b", "#6366f1", "#ec4899"],
      grid: {
        borderColor: "rgba(226, 232, 240, 0.6)",
        strokeDashArray: 4
      },
      fill: {
        type: chart.type === "area" ? "gradient" : "solid",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 92, 100]
        }
      },
      stroke: {
        curve: "smooth",
        width: chart.type === "line" || chart.type === "area" ? 3 : 0
      },
      tooltip: {
        enabled: true,
        theme: "light",
        y: {
          formatter: (value) => `${Number(value).toLocaleString()}`
        }
      },
      markers: {
        size: chart.type === "line" || chart.type === "area" ? 5 : 0,
        hover: { size: 8 }
      },
      states: { hover: { filter: { type: "lighten", value: 0.15 } } },
      dataLabels: { enabled: false }
    };

    let options;

    if(chart.type==="pie"||chart.type==="donut"){
      const pie=buildPieDataset(flat,chart.source);
      options={...common,series:pie.values,labels:pie.labels,legend:{position:"bottom"}};
    }else{
      options={
        ...common,
        series:buildAdvancedSeries(flat,chart.type),
        xaxis:{categories:Object.keys(flat)}
      };
    }

    instance.current=new ApexCharts(ref.current,options);
    instance.current.render();

    return ()=>instance.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart.type, chart.source, flatString]);

  const isPie=chart.type==="pie"||chart.type==="donut";

  return (
    <div style={{
      background: chartCardGradient,
      padding: 24,
      borderRadius: 20,
      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ marginBottom: 20, display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <select
          style={dropdownStyle}
          value={chart.type}
          onChange={e=>updateChart(index,"type",e.target.value)}
        >
          {chartTypes.map(t=><option key={t}>{t}</option>)}
        </select>

        {isPie&&(
          <select
            style={dropdownStyle}
            value={chart.source}
            onChange={e=>updateChart(index,"source",e.target.value)}
          >
            <option>Power</option>
            <option>Fuel</option>
            <option>Both</option>
          </select>
        )}
      </div>

      <div ref={ref} style={{height:320}}/>
    </div>
  );
});

/* ---------- DASHBOARD ---------- */
export default function Dashboard(){
  const plant = localStorage.getItem("plant");
  const today=new Date();
  const [year,setYear]=useState(today.getFullYear());
  const [month,setMonth]=useState(today.getMonth());
  const [showCal,setShowCal]=useState(false);
  const [data,setData]=useState(null);

  const [charts,setCharts]=useState([
    {type:"bar",source:"Both"},
    {type:"line",source:"Both"},
    {type:"pie",source:"Both"},
    {type:"donut",source:"Both"}
  ]);

  useEffect(()=>{
    if (!plant) return;
    fetch(`http://localhost:5000/api/carbon/dashboard/${plant}/${month+1}/${year}`)
      .then(res=>res.json())
      .then(d=>setData(d))
      .catch(()=>setData(null));
  },[year,month,plant]);

  if (!plant) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 20, border: "1px solid #ddd" }}>
          <h2 style={{ color: "#0f172a", margin: "0 0 10px 0" }}>No Plant Selected</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Please select a plant location in the settings to view data.</p>
        </div>
      </div>
    );
  }

  const safeData = data?.inputs && data?.kpis
    ? data
    : {
        inputs: {},
        kpis: {
          renewablePercent: 0,
          greenFuelPercent: 0,
          energyRatio: 0,
          totalCarbonMT: 0,
          carbonIntensity: 0,
          totalEnergyMJ: 0
        }
      };

  const updateChart=(i,key,value)=>{
    setCharts(prev=>{
      const copy=[...prev];
      copy[i]={...copy[i],[key]:value};
      return copy;
    });
  };

  const arrowStyle={
    background:"#0f766e",
    color:"#fff",
    border:"none",
    borderRadius:8,
    width:36,
    height:36,
    cursor:"pointer",
    fontSize:16,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    transition: "background 0.2s"
  };

  const kpis=safeData.kpis;

  return(
    <div style={styles.dashboardContainer}>

      {/* Modern Dashboard Header */}
      <div style={styles.header}>
        <div style={styles.headerTitleArea}>
          <h1 style={styles.title}>Carbon Intelligence Dashboard</h1>
          <p style={styles.subtitle}>
            Real-time industrial carbon tracking, emissions analytics, and compliance audit records
          </p>
        </div>

        {/* Date Selector Wrapper */}
        <div style={{ position: "relative" }}>
          <button
            onClick={()=>setShowCal(v=>!v)}
            style={styles.calendarBtn}
          >
            <FiCalendar />
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month]} {year}
          </button>

          {showCal && (
            <div style={styles.calendarDropdown}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:16, alignItems: "center"}}>
                <button onClick={()=>setYear(y=>y-1)} style={arrowStyle}>{"<"}</button>
                <b style={{color:"#0f766e", fontSize: 16}}>{year}</b>
                <button onClick={()=>setYear(y=>y+1)} style={arrowStyle}>{">"}</button>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                  <button
                    key={m}
                    onClick={()=>{setMonth(i);setShowCal(false);}}
                    style={{
                      padding:"8px 0",
                      borderRadius:8,
                      border:"none",
                      background:i===month?"#10b981":"transparent",
                      color:i===month?"#fff":"#475569",
                      cursor:"pointer",
                      fontSize:12,
                      fontWeight:600,
                      transition:"all 0.2s"
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

      {/* 3x2 KPI Grid */}
      <div style={styles.kpiGrid}>
        <KpiCard index={0} title="Total RE %" value={kpis.renewablePercent} icon={<FiSun />} />
        <KpiCard index={1} title="Total Green Fuel %" value={kpis.greenFuelPercent} icon={<FiWind />} />
        <KpiCard index={2} title="Energy Usage Ratio" value={kpis.energyRatio} icon={<FiSettings />} />
        <KpiCard index={3} title="Carbon Footprint (MT)" value={kpis.totalCarbonMT} icon={<FiActivity />} />
        <KpiCard index={4} title="Carbon Intensity" value={kpis.carbonIntensity} icon={<FiTarget />} />
        <KpiCard index={5} title="Total Energy (MJ)" value={kpis.totalEnergyMJ} icon={<FiZap />} />
      </div>

      {/* Main Grid Content (Charts left, Insights & Overview right) */}
      <div style={styles.mainLayoutGrid}>
        
        {/* Left column: Charts */}
        <div style={styles.chartsColumn}>
          <h3 style={styles.sectionTitle}>Carbon & Energy Analytics</h3>
          <div style={styles.chartsGrid}>
            {charts.map((chart,i)=>(
              <ChartCard
                key={i}
                chart={chart}
                index={i}
                inputs={safeData.inputs}
                updateChart={updateChart}
              />
            ))}
          </div>
        </div>

        {/* Right column: Widgets & Overview */}
        <div style={styles.widgetsColumn}>
          
          {/* Overview Panel Card */}
          <div style={styles.rightWidgetCard}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
              Renewable Energy & Fuel Mix
            </h4>
            
            <div style={{ display: "flex", gap: "24px", alignItems: "center", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto" }}>
                  <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3"
                            strokeDasharray={`${kpis.renewablePercent || 0} ${100 - (kpis.renewablePercent || 0)}`}
                            strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                    {kpis.renewablePercent}%
                  </div>
                </div>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block", marginTop: "8px" }}>Renewable Mix</span>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto" }}>
                  <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(15, 118, 110, 0.08)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0f766e" strokeWidth="3"
                            strokeDasharray={`${kpis.greenFuelPercent || 0} ${100 - (kpis.greenFuelPercent || 0)}`}
                            strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                    {kpis.greenFuelPercent}%
                  </div>
                </div>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block", marginTop: "8px" }}>Green Fuel Mix</span>
              </div>
            </div>
          </div>

          {/* AI Insight Widget */}
          <div style={styles.rightWidgetCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ ...styles.widgetIcon, color: "#10b981", background: "rgba(16, 185, 129, 0.08)" }}>
                <FiCpu />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>AI Recommendation</h4>
                <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Active optimization logic</span>
              </div>
            </div>
            
            <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
              <strong>Insight:</strong> Energy usage ratio is {kpis.energyRatio > 1.5 ? "elevated" : "nominal"}. Shifting 15% grid load to solar arrays during peak solar hours (11 AM - 2 PM) is recommended.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1, padding: "10px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                <div style={{ fontSize: "10px", color: "#047857", fontWeight: 700, textTransform: "uppercase" }}>Est. Reduction</div>
                <div style={{ fontSize: "15px", color: "#065f46", fontWeight: 900, marginTop: "2px" }}>-12.4% CO₂</div>
              </div>
              <div style={{ flex: 1, padding: "10px", borderRadius: "12px", background: "rgba(6, 182, 212, 0.06)", border: "1px solid rgba(6, 182, 212, 0.1)" }}>
                <div style={{ fontSize: "10px", color: "#0891b2", fontWeight: 700, textTransform: "uppercase" }}>Credit Yield</div>
                <div style={{ fontSize: "15px", color: "#155e75", fontWeight: 900, marginTop: "2px" }}>+8% Credits</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div style={styles.rightWidgetCard}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Recent Operational Activity</h4>
            
            <div style={styles.timeline}>
              <div style={styles.timelineItem}>
                <div style={styles.timelinePoint}><FiCheckCircle style={{ color: "#10b981" }} /></div>
                <div style={styles.timelineContent}>
                  <div style={styles.timelineTitle}>Compliance records audited</div>
                  <div style={styles.timelineTime}>1 hour ago</div>
                </div>
              </div>
              
              <div style={styles.timelineItem}>
                <div style={styles.timelinePoint}><FiFileText style={{ color: "#3b82f6" }} /></div>
                <div style={styles.timelineContent}>
                  <div style={styles.timelineTitle}>Bhopal report generated</div>
                  <div style={styles.timelineTime}>3 hours ago</div>
                </div>
              </div>

              <div style={styles.timelineItem}>
                <div style={styles.timelinePoint}><FiClock style={{ color: "#8b5cf6" }} /></div>
                <div style={styles.timelineContent}>
                  <div style={styles.timelineTitle}>Fuel injection logs verified</div>
                  <div style={styles.timelineTime}>Yesterday</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .kpi-dashboard-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 25px rgba(15, 118, 110, 0.08) !important;
        }
      `}</style>

    </div>
  );
}

const styles = {
  dashboardContainer: {
    maxWidth: "1350px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    minHeight: "100vh"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap"
  },

  headerTitleArea: {
    flex: "1"
  },

  title: {
    fontSize: "30px",
    fontWeight: 900,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.8px"
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0 0",
    fontWeight: 500
  },

  calendarBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f766e",
    background: "#ffffff",
    border: "1px solid rgba(15, 118, 110, 0.15)",
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
    transition: "all 0.2s"
  },

  calendarDropdown: {
    position:"absolute",
    top: 52,
    right: 0,
    background: "#ffffff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
    zIndex: 50,
    width: 250,
    border: "1px solid rgba(15, 118, 110, 0.1)"
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px"
  },

  mainLayoutGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "32px",
    alignItems: "start"
  },

  chartsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px"
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px"
  },

  widgetsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    position: "sticky",
    top: "24px"
  },

  rightWidgetCard: {
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)"
  },

  widgetIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px"
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "relative",
    paddingLeft: "8px"
  },

  timelineItem: {
    display: "flex",
    gap: "14px",
    position: "relative"
  },

  timelinePoint: {
    fontSize: "16px",
    zIndex: 2,
    background: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  timelineContent: {
    flex: 1
  },

  timelineTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#0f172a"
  },

  timelineTime: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px"
  }
};