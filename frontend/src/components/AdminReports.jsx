import React, { useEffect, useState, useRef } from "react";
import ApexCharts from "apexcharts";
import { 
  FiCalendar, FiChevronLeft, FiChevronRight, FiFileText, FiActivity, 
  FiZap, FiTarget, FiLoader, FiSun, FiMapPin, FiAlignLeft
} from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { triggerPrintFlow, generateExcel } from "../services/ReportExportService";

const API_BASE = import.meta.env.VITE_API_URL;
const MOCK_PLANTS = ["Bhopal", "Delhi", "Mumbai", "Pune", "Chennai", "Hyderabad"];
const REPORT_TYPES = ["Summary", "Detailed Emissions", "Energy Consumption", "Fuel Consumption", "Carbon Intensity"];
const PERIOD_TYPES = ["Month", "Quarter", "Year"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const QUARTERS = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];
const COLORS = ["#14b8a6", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#10b981", "#f43f5e", "#64748b"];

export default function AdminReports() {
  const [selectedPlant, setSelectedPlant] = useState(localStorage.getItem("plant") || "Bhopal");
  const [selectedPeriodType, setSelectedPeriodType] = useState("Month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [quarterIndex, setQuarterIndex] = useState(Math.floor(new Date().getMonth() / 3));
  const [selectedReport, setSelectedReport] = useState("Summary");
  const [plantsList, setPlantsList] = useState([]);
  
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/carbon/plants`);
        if (res.ok) {
          const list = await res.json();
          setPlantsList(list);
          if (list.length > 0) {
            const savedPlant = localStorage.getItem("plant") || "";
            const matched = list.find(p => p.trim().toLowerCase() === savedPlant.trim().toLowerCase());
            setSelectedPlant(matched || list[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching plants for admin reports:", err);
      }
    };
    fetchPlants();
  }, []);

  
  // Data State
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Printing & Serialization State
  const [isPrinting, setIsPrinting] = useState(false);
  const [chartImage, setChartImage] = useState(null);
  const [serializedImage, setSerializedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setSerializedImage(null);
    setLoading(true);

    let monthsToFetch = [];
    if (selectedPeriodType === "Month") {
      monthsToFetch = [monthIndex + 1];
    } else if (selectedPeriodType === "Quarter") {
      const start = quarterIndex * 3 + 1;
      monthsToFetch = [start, start + 1, start + 2];
    } else {
      monthsToFetch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }

    const fetchData = async () => {
      try {
        const promises = monthsToFetch.map(m => 
          fetch(`${API_BASE}/api/carbon/dashboard/${selectedPlant}/${m}/${year}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );

        const results = await Promise.all(promises);
        if (!isMounted) return;

        const valids = results.filter(d => d && d.inputs && d.kpis);
        const aggregated = valids.reduce((acc, d) => {
          const i = d.inputs;
          const p = i.powerConsumption || {};
          const f = i.fuelConsumption || {};
          const k = d.kpis || {};
          
          acc.power.grid += p.gridPowerKWh || 0;
          acc.power.renew += p.renewablePowerKWh || 0;
          acc.power.solar += p.solarPowerKWh || 0;
          
          acc.fuel.hsd += f.hsdLitre || 0;
          acc.fuel.png += (f.pngSCM || f.pngScm || 0);
          acc.fuel.lpg += f.lpgKg || 0;
          acc.fuel.fur += f.furnaceOilLitre || 0;
          acc.fuel.bio += (f.biomassMJ || f.biomassMj || 0);

          acc.prod += i.beverageProduction || 0;
          acc.energy += k.totalEnergyMJ || 0;
          acc.carbon += k.totalCarbonMT ? parseFloat(k.totalCarbonMT) : 0;
          
          return acc;
        }, {
          power: { grid: 0, renew: 0, solar: 0 },
          fuel: { hsd: 0, png: 0, lpg: 0, fur: 0, bio: 0 },
          prod: 0, energy: 0, carbon: 0, count: valids.length
        });

        setReportData(aggregated);
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [selectedPlant, selectedPeriodType, monthIndex, quarterIndex, year]);

  const handlePrint = () => {
    triggerPrintFlow(serializedImage, setChartImage, setIsPrinting);
  };

  const handleExportExcel = () => {
    generateExcel(reportData, selectedPlant, selectedReport, getPeriodLabel(), year);
  };
  
  const getPeriodLabel = () => {
    if (selectedPeriodType === "Month") return `${MONTHS[monthIndex]} ${year}`;
    if (selectedPeriodType === "Quarter") return `${QUARTERS[quarterIndex]} ${year}`;
    return `FY ${year}`;
  };

  return (
    <div style={{
      background: "none",
      minHeight: "auto",
      padding: "0",
      fontFamily: "'Inter', sans-serif",
      color: "#0f172a"
    }}>
      
      {/* Hide controls when printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-container { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontSize: 20, fontWeight: 800 }}>
          Carbon Compliance Reports
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 14, fontWeight: 500 }}>
          Select filter criteria below to audit and compile plant records.
        </p>
      </div>

      {/* CONTROLS PANEL */}
      <div className="no-print" style={{
        background: "white", padding: 24, borderRadius: 20,
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)", border: "1px solid rgba(226, 232, 240, 0.8)", marginBottom: 32,
        display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end", justifyContent: "space-between"
      }}>
        
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", flex: 1 }}>
            {/* Plant Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={labelStyle}><FiMapPin/> Plant Location</label>
                <select style={inputStyle} value={selectedPlant} onChange={e => setSelectedPlant(e.target.value)}>
                    {plantsList.map(p => <option key={p} value={p}>{p}</option>)}
                    {plantsList.length === 0 && <option value="">No Plants Available</option>}
                </select>
            </div>

            {/* Period Type Toggle */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={labelStyle}><FiCalendar/> Report Period</label>
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 4 }}>
                    {PERIOD_TYPES.map(pt => (
                        <button key={pt} onClick={() => setSelectedPeriodType(pt)} style={{
                            padding: "8px 16px", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13,
                            background: selectedPeriodType === pt ? "#0f766e" : "transparent",
                            color: selectedPeriodType === pt ? "white" : "#64748b", cursor: "pointer", transition: "0.2s"
                        }}>
                            {pt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Selection Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                 <label style={labelStyle}>Select {selectedPeriodType}</label>
                 <div style={{ display: "flex", gap: 8 }}>
                     {selectedPeriodType === "Month" && (
                          <select style={inputStyle} value={monthIndex} onChange={e => setMonthIndex(parseInt(e.target.value))}>
                              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                          </select>
                     )}
                     {selectedPeriodType === "Quarter" && (
                          <select style={inputStyle} value={quarterIndex} onChange={e => setQuarterIndex(parseInt(e.target.value))}>
                              {QUARTERS.map((q, i) => <option key={q} value={i}>{q}</option>)}
                          </select>
                     )}
                     <div style={{ display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: "0 4px" }}>
                        <button onClick={() => setYear(y => y-1)} style={{ border: "none", background: "none", color: "#0f766e", cursor: "pointer", padding: "6px" }}><FiChevronLeft/></button>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", padding: "0 8px" }}>{year}</span>
                        <button onClick={() => setYear(y => y+1)} style={{ border: "none", background: "none", color: "#0f766e", cursor: "pointer", padding: "6px" }}><FiChevronRight/></button>
                     </div>
                 </div>
            </div>

            {/* Report Type Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
                <label style={labelStyle}><FiAlignLeft/> Report Category</label>
                <select style={{...inputStyle, fontWeight: 700, color: "#0f766e", border: "1px solid #99f6e4"}} value={selectedReport} onChange={e => setSelectedReport(e.target.value)}>
                    {REPORT_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
        </div>

        <button onClick={() => {}} style={{
            background: "linear-gradient(135deg, #0d9488, #14b8a6)", color: "white", border: "none", 
            borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 15px rgba(20, 184, 166, 0.2)", display: "flex", alignItems: "center", gap: 8,
            transition: "0.2s"
        }}>
            <FiActivity size={18} /> Auto-Saving View
        </button>
      </div>

      {/* REPORT CONTENT AREA */}
      <div className="report-container" style={{
          background: "white", padding: 40, borderRadius: 20, boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
          border: "1px solid rgba(226, 232, 240, 0.8)", minHeight: 600, position: "relative"
      }}>
          
        {/* Output Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #f1f5f9", paddingBottom: 20, marginBottom: 30 }}>
            <div>
                <h2 style={{ margin: 0, fontSize: 28, color: "#0f172a", fontWeight: 800 }}>{selectedReport} Report</h2>
                <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                    <Tag icon={<FiMapPin/>} text={selectedPlant} />
                    <Tag icon={<FiCalendar/>} text={getPeriodLabel()} />
                    <Tag icon={<FiFileText/>} text={`Generated: ${new Date().toLocaleDateString()}`} bg="#f0fdf4" color="#16a34a" />
                </div>
            </div>
            
            <div className="no-print" style={{ display: "flex", gap: 8 }}>
                <button onClick={handlePrint} style={actionButtonStyle} title="Print/Save as PDF"><FaFilePdf size={18} /> Export PDF</button>
                <button onClick={handleExportExcel} style={actionButtonStyle} title="Export Excel Data"><FaFileExcel size={18} /> Export Excel</button>
            </div>
        </div>

        {/* Dynamic Report Content */}
        {loading ? (
             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 100, color: "#0f766e" }}>
                 <FiLoader size={48} style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
                 <h3 style={{ margin: 0 }}>Compiling Report...</h3>
                 <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
             </div>
        ) : !reportData || reportData.count === 0 ? (
             <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
                 <FiActivity size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                 <h3>No data found for the selected parameters.</h3>
             </div>
        ) : (
             <ReportRenderer 
               type={selectedReport} 
               data={reportData} 
               isPrinting={isPrinting}
               chartImage={chartImage}
               setSerializedImage={setSerializedImage}
             />
        )}
      </div>

    </div>
  );
}

// Subcomponents and Styling
const labelStyle = { fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 };
const inputStyle = { padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#1e293b", fontSize: 14, minWidth: 140, outline: "none", cursor: "pointer" };
const actionButtonStyle = { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontWeight: 700, cursor: "pointer", transition: "0.2s" };

function Tag({ icon, text, bg = "#f1f5f9", color = "#475569" }) {
    return <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: bg, color, fontSize: 13, fontWeight: 600 }}>
        {icon} {text}
    </div>
}

function ReportRenderer({ type, data, isPrinting, chartImage, setSerializedImage }) {
    const totalPower = data.power.grid + data.power.renew + data.power.solar;
    const renewRatio = totalPower > 0 ? ((data.power.renew + data.power.solar) / totalPower * 100).toFixed(1) : 0;
    const intensity = data.prod > 0 ? (data.carbon / data.prod).toFixed(4) : 0;
    
    const s1_hsd = (data.fuel.hsd * 2.68) / 1000;
    const s1_fur = (data.fuel.fur * 2.68) / 1000;
    const s1_lpg = (data.fuel.lpg * 2.98) / 1000;
    const s1_png = (data.fuel.png * 2.02) / 1000;
    const s1_bio = (data.fuel.bio * 0.05) / 1000;
    const scope1 = s1_hsd + s1_fur + s1_lpg + s1_png + s1_bio;
    
    const scope2 = (data.power.grid * 0.82) / 1000;

    switch (type) {
        case "Summary": {
            const summaryOptions = {
              chart: {
                type: "donut",
                height: 250,
                toolbar: { show: false },
                animations: { enabled: false }
              },
              colors: ["#f97316", "#3b82f6"],
              series: [scope1, scope2],
              labels: ["Scope 1 (Direct)", "Scope 2 (Indirect)"],
              legend: {
                position: "bottom",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                labels: { colors: "#475569" }
              },
              dataLabels: {
                enabled: true,
                formatter: (val, opts) => `${opts.w.globals.series[opts.seriesIndex].toFixed(2)} MT`
              },
              plotOptions: {
                pie: {
                  donut: {
                    size: '65%',
                    labels: {
                      show: true,
                      name: { show: true, fontSize: '14px', fontWeight: 600, color: '#64748b' },
                      value: {
                        show: true,
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#0f172a',
                        formatter: (val) => `${parseFloat(val).toFixed(2)} MT`
                      },
                      total: {
                        show: true,
                        label: "Total CO₂e",
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#64748b',
                        formatter: () => `${(scope1 + scope2).toFixed(2)} MT`
                      }
                    }
                  }
                }
              }
            };

            return (
                <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                        <StatCard label="Total Carbon Footprint" value={data.carbon.toFixed(2)} unit="MT CO₂e" icon={<FiActivity/>} color="#ef4444" />
                        <StatCard label="Carbon Intensity" value={intensity} unit="kg CO₂/L" icon={<FiTarget/>} color="#f59e0b" />
                        <StatCard label="Total Energy Consumed" value={data.energy.toLocaleString()} unit="MJ" icon={<FiZap/>} color="#eab308" />
                        <StatCard label="Renewable Mix" value={renewRatio} unit="%" icon={<FiSun/>} color="#10b981" />
                    </div>
                    
                    <div className="report-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                        <ReportBox title="Footprint Breakdown (Scope 1 vs 2)">
                            <ReportsApexChart
                                options={summaryOptions}
                                isPrinting={isPrinting}
                                chartImage={chartImage}
                                onChartRendered={setSerializedImage}
                            />
                        </ReportBox>
                        
                        <ReportBox title="High Level Observations">
                            <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155", fontWeight: 500 }}>
                                <li>The plant operated for the period with a total production output of <strong>{data.prod.toLocaleString()} Liters</strong>.</li>
                                <li><strong>{renewRatio}%</strong> of electrical energy consumed came from renewable and solar sources.</li>
                                <li>The estimated Carbon Intensity for this period stands at <strong>{intensity}</strong> kg per liter of product.</li>
                                {scope1 > scope2 ? <li>Scope 1 emissions predominantly drive your carbon footprint.</li> : <li>Scope 2 (Grid Electricity) is the largest contributor to the overall footprint.</li>}
                            </ul>
                        </ReportBox>
                    </div>
                </div>
            );
        }

        case "Detailed Emissions": {
            const detailedOptions = {
              chart: {
                type: "bar",
                height: 300,
                toolbar: { show: false },
                animations: { enabled: false }
              },
              colors: ["#14b8a6"],
              series: [{
                name: "Emissions",
                data: [
                  parseFloat(s1_hsd.toFixed(3)),
                  parseFloat(s1_fur.toFixed(3)),
                  parseFloat(s1_lpg.toFixed(3)),
                  parseFloat(s1_png.toFixed(3)),
                  parseFloat(scope2.toFixed(3))
                ]
              }],
              xaxis: {
                categories: ["HSD", "Furnace", "LPG", "PNG", "Grid"],
                labels: { style: { fontFamily: "'Inter', sans-serif", fontWeight: 600, colors: "#475569" } }
              },
              yaxis: {
                labels: {
                  formatter: (val) => `${val.toFixed(2)} MT`,
                  style: { fontFamily: "'Inter', sans-serif", fontWeight: 600, colors: "#475569" }
                }
              },
              grid: {
                borderColor: "rgba(226, 232, 240, 0.6)",
                strokeDasharray: 4
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  columnWidth: '50%',
                  dataLabels: { position: 'top' }
                }
              },
              dataLabels: {
                enabled: true,
                formatter: (val) => `${val.toFixed(2)}`,
                offsetY: -20,
                style: {
                  fontSize: '12px',
                  colors: ["#334155"]
                }
              }
            };

            return (
                <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                    <ReportBox title="Emissions Inventory Table" border>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", color: "#475569", fontSize: 13, textTransform: "uppercase" }}>
                                    <th style={th}>Emission Source</th>
                                    <th style={th}>Scope</th>
                                    <th style={th}>Raw Value</th>
                                    <th style={th}>Emission Factor</th>
                                    <th style={th}>CO₂e (MT)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <Trow source="HSD (Diesel)" scope="1" val={data.fuel.hsd} u="L" factor="2.68 kg/L" total={s1_hsd}/>
                                <Trow source="Furnace Oil" scope="1" val={data.fuel.fur} u="L" factor="2.68 kg/L" total={s1_fur}/>
                                <Trow source="LPG" scope="1" val={data.fuel.lpg} u="kg" factor="2.98 kg/kg" total={s1_lpg}/>
                                <Trow source="PNG" scope="1" val={data.fuel.png} u="SCM" factor="2.02 kg/SCM" total={s1_png}/>
                                <Trow source="Biomass" scope="1" val={data.fuel.bio} u="MJ" factor="0.05 kg/MJ" total={s1_bio}/>
                                <Trow source="Grid Electricity" scope="2" val={data.power.grid} u="kWh" factor="0.82 kg/kWh" total={scope2}/>
                                <tr style={{ background: "#f0fdfa", fontWeight: 800 }}>
                                    <td colSpan={4} style={td}>Total Emissions</td>
                                    <td style={td}>{(scope1 + scope2).toFixed(2)} MT</td>
                                </tr>
                            </tbody>
                        </table>
                    </ReportBox>
                    
                    <ReportBox title="Emissions by Source Group">
                        <ReportsApexChart
                            options={detailedOptions}
                            isPrinting={isPrinting}
                            chartImage={chartImage}
                            onChartRendered={setSerializedImage}
                        />
                    </ReportBox>
                </div>
            );
        }

        case "Energy Consumption": {
            const eMix = [
                { name: "Grid", val: data.power.grid },
                { name: "Renewable", val: data.power.renew },
                { name: "Solar", val: data.power.solar }
            ].filter(d => d.val > 0);

            const energyOptions = {
              chart: {
                type: "donut",
                height: 300,
                toolbar: { show: false },
                animations: { enabled: false }
              },
              colors: ["#ef4444", "#10b981", "#eab308"],
              series: eMix.map(d => d.val),
              labels: eMix.map(d => d.name),
              legend: {
                position: "bottom",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                labels: { colors: "#475569" }
              },
              dataLabels: {
                enabled: true,
                formatter: (val, opts) => `${opts.w.globals.series[opts.seriesIndex].toLocaleString()} kWh`
              },
              plotOptions: {
                pie: {
                  donut: {
                    size: '65%',
                    labels: {
                      show: true,
                      name: { show: true, fontSize: '14px', fontWeight: 600, color: '#64748b' },
                      value: {
                        show: true,
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#0f172a',
                        formatter: (val) => `${parseInt(val).toLocaleString()} kWh`
                      },
                      total: {
                        show: true,
                        label: "Total Power",
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#64748b',
                        formatter: () => {
                          const total = eMix.reduce((acc, curr) => acc + curr.val, 0);
                          return `${total.toLocaleString()} kWh`;
                        }
                      }
                    }
                  }
                }
              }
            };

            return (
                <div className="report-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                    <ReportBox title="Electricity Mix Breakdown">
                        <ReportsApexChart
                            options={energyOptions}
                            isPrinting={isPrinting}
                            chartImage={chartImage}
                            onChartRendered={setSerializedImage}
                        />
                    </ReportBox>
                    <ReportBox title="Energy Performance Summary" border>
                         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                              <KRow label="Total Electricity (kWh)" val={totalPower.toLocaleString()} />
                              <KRow label="Grid Power (kWh)" val={data.power.grid.toLocaleString()} color="#ef4444" />
                              <KRow label="Solar + Renewable (kWh)" val={(data.power.solar+data.power.renew).toLocaleString()} color="#10b981" />
                              <hr style={{ border: "none", borderTop: "1px dashed #cbd5e1" }} />
                              <KRow label="Total Calculated Energy (MJ)" val={data.energy.toLocaleString()} />
                              <KRow label="Energy Ratio (MJ/L)" val={data.prod > 0 ? (data.energy / data.prod).toFixed(2) : 0} />
                         </div>
                    </ReportBox>
                </div>
            );
        }

        case "Fuel Consumption": {
            const fuelOptions = {
              chart: {
                type: "bar",
                height: 300,
                toolbar: { show: false },
                animations: { enabled: false }
              },
              colors: ["#f59e0b"],
              series: [{
                name: "Consumption",
                data: [data.fuel.hsd, data.fuel.fur, data.fuel.png, data.fuel.lpg, data.fuel.bio]
              }],
              xaxis: {
                categories: ["HSD", "Furnace", "PNG", "LPG", "Biomass"],
                labels: { style: { fontFamily: "'Inter', sans-serif", fontWeight: 600, colors: "#475569" } }
              },
              yaxis: {
                labels: {
                  style: { fontFamily: "'Inter', sans-serif", fontWeight: 600, colors: "#475569" }
                }
              },
              grid: {
                borderColor: "rgba(226, 232, 240, 0.6)",
                strokeDasharray: 4
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  horizontal: true,
                  barHeight: '60%',
                  dataLabels: { position: 'right' }
                }
              },
              dataLabels: {
                enabled: true,
                formatter: (val) => `${val.toLocaleString()}`,
                offsetX: 10,
                style: {
                  fontSize: '11px',
                  colors: ["#334155"]
                }
              }
            };

            return (
                 <div className="report-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                    <ReportBox title="Fuel Source Analysis">
                        <ReportsApexChart
                            options={fuelOptions}
                            isPrinting={isPrinting}
                            chartImage={chartImage}
                            onChartRendered={setSerializedImage}
                        />
                    </ReportBox>
                    <ReportBox title="Green Fuel Highlights" border>
                         <div style={{ background: "#f0fdf4", padding: 20, borderRadius: 12, border: "1px solid #bbf7d0", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                             <FiSun size={48} color="#22c55e" style={{ marginBottom: 16 }} />
                             <h3 style={{ margin: "0 0 8px 0", color: "#166534" }}>Biomass Utilization</h3>
                             <p style={{ fontSize: 32, fontWeight: 900, margin: 0, color: "#15803d" }}>{(data.fuel.bio).toLocaleString()} MJ</p>
                             <p style={{ color: "#166534", marginTop: 12, fontWeight: 500 }}>
                                Utilizing green fuel significantly offsets the carbon impacts generated by traditional fossil fuels.
                             </p>
                         </div>
                    </ReportBox>
                </div>
            );
        }

        case "Carbon Intensity": {
            return (
                 <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                     <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                          <StatCard label="Net Carbon Output" value={data.carbon.toFixed(1)} unit="MT CO₂e" icon={<FiActivity/>} color="#ef4444" />
                          <StatCard label="Production Volume" value={data.prod.toLocaleString()} unit="Liters" icon={<FiAlignLeft/>} color="#3b82f6" />
                          <StatCard label="Calculated Intensity" value={intensity} unit="kg CO₂/L" icon={<FiTarget/>} color="#10b981" />
                     </div>
                     <ReportBox title="Intensity Metric Use-cases">
                         <div className="report-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                              <div style={{ padding: 20, background: "#f8fafc", borderRadius: 12 }}>
                                  <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Internal Scorecards</h4>
                                   <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>Intensity measures efficiency regardless of scale. Tracking this helps validate if production optimizations are truly decoupling emissions from growth.</p>
                              </div>
                              <div style={{ padding: 20, background: "#f8fafc", borderRadius: 12 }}>
                                  <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Compliance vs Target</h4>
                                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>By standardizing emissions against {data.prod > 0 ? "liters produced" : "production output"}, auditing becomes straightforward against global or industry sustainability benchmarks.</p>
                              </div>
                         </div>
                     </ReportBox>
                 </div>
            );
        }

        default:
            return <div>Report view not found.</div>;
    }
}

// Helpers
const th = { padding: 12, borderBottom: "2px solid #e2e8f0" };
const td = { padding: 12, borderBottom: "1px solid #e2e8f0", fontSize: 14, color: "#334155" };

const Trow = ({ source, scope, val, u, factor, total }) => (
    val > 0 ? (
        <tr>
            <td style={{ ...td, fontWeight: 700 }}>{source}</td>
            <td style={td}>Scope {scope}</td>
            <td style={td}>{val.toLocaleString()} {u}</td>
            <td style={td}>{factor}</td>
            <td style={{ ...td, color: "#0f766e", fontWeight: 700 }}>{total.toFixed(2)}</td>
        </tr>
    ) : null
);

const KRow = ({ label, val, color="#1e293b" }) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 600 }}>
        <span style={{ color: "#64748b" }}>{label}</span>
        <span style={{ color }}>{val}</span>
    </div>
);

function StatCard({ label, value, unit, icon, color }) {
    return (
        <div style={{ background: "#f8fafc", padding: 20, borderRadius: 16, display: "flex", alignItems: "center", gap: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ background: `${color}15`, color, width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{value} <span style={{fontSize: 14, color: "#94a3b8"}}>{unit}</span></div>
            </div>
        </div>
    )
}

function ReportBox({ title, children, border }) {
    return (
        <div style={{ background: border ? "#fff" : "transparent", padding: border ? 24 : 0, borderRadius: 16, border: border ? "1px solid #cbd5e1" : "none" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 18, color: "#1e293b", fontWeight: 800 }}>{title}</h3>
            {children}
        </div>
    );
}

function ReportsApexChart({ options, isPrinting, chartImage, onChartRendered }) {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (instance.current) {
      instance.current.destroy();
    }

    const finalOptions = {
      ...options,
      chart: {
        ...options.chart,
        animations: {
          enabled: false // animations disabled on reports to support instant serialization
        }
      }
    };

    instance.current = new ApexCharts(ref.current, finalOptions);
    instance.current.render().then(() => {
      if (onChartRendered && instance.current) {
        setTimeout(() => {
          if (instance.current) {
            instance.current.dataURI().then(({ imgURI }) => {
              onChartRendered(imgURI);
            }).catch(err => console.error("ApexCharts dataURI error:", err));
          }
        }, 150);
      }
    });

    return () => {
      if (instance.current) {
        instance.current.destroy();
        instance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, isPrinting]);

  return (
    <div style={{ position: "relative", width: "100%", height: options.chart.height }}>
      {isPrinting && chartImage ? (
        <img 
          src={chartImage} 
          style={{ 
            width: "100%", 
            height: options.chart.height, 
            display: "block", 
            objectFit: "contain" 
          }} 
          alt="Chart Export" 
        />
      ) : (
        <div ref={ref} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
}
