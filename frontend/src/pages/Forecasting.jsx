import React, { useEffect, useState, useRef, memo } from "react";
import ApexCharts from "apexcharts";
import { 
  FiActivity, FiZap, FiTarget, FiSun, FiLoader, 
  FiAlertCircle, FiCheckCircle, FiTrendingUp,
  FiTrendingDown, FiMapPin, FiCompass, FiShield, FiSliders, FiCpu
} from "react-icons/fi";
import { FaLeaf, FaCar, FaTree, FaBolt } from "react-icons/fa";

const FACTORS = {
  GRID_CO2: 0.82,
  LPG_CO2: 3.0,
  HSD_CO2: 2.68,
  PNG_CO2: 2.1,
  FURNACE_CO2: 3.1,
  KWH_TO_MJ: 3.6,
  LPG_TO_MJ: 46,
  HSD_TO_MJ: 38,
  PNG_TO_MJ: 35,
  FURNACE_TO_MJ: 40
};

const PRESETS = {
  "Current Operations": { renewable: 15, fuel: 0, electricity: 0, production: 0, offset: 0, efficiency: 0 },
  "Green Transition": { renewable: 40, fuel: -10, electricity: -5, production: 5, offset: 10, efficiency: 15 },
  "Renewable Energy Expansion": { renewable: 75, fuel: 0, electricity: 5, production: 10, offset: 5, efficiency: 10 },
  "Aggressive Carbon Reduction": { renewable: 90, fuel: -30, electricity: -15, production: 0, offset: 25, efficiency: 25 },
  "Net Zero Roadmap": { renewable: 100, fuel: -50, electricity: -25, production: 0, offset: 50, efficiency: 40 }
};

// OLS Linear Regression Helper
const calculateLinearTrend = (data, valueExtractor) => {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = valueExtractor(data[i]);
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  
  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }
  
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

export default function Forecasting() {
  const [plantsList, setPlantsList] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(localStorage.getItem("plant") || "Bhopal");
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forecast duration (3, 5, 10 Years)
  const [duration, setDuration] = useState(5);
  
  // Sliders State
  const [sliderRenewable, setSliderRenewable] = useState(25);
  const [sliderFuel, setSliderFuel] = useState(0);
  const [sliderElectricity, setSliderElectricity] = useState(0);
  const [sliderProduction, setSliderProduction] = useState(0);
  const [sliderOffset, setSliderOffset] = useState(0); // in Lakhs
  const [sliderEfficiency, setSliderEfficiency] = useState(0);
  
  // Active Scenario preset
  const [activeScenario, setActiveScenario] = useState("Green Transition");

  // Fetch plant list
  useEffect(() => {
    fetch("http://localhost:5000/api/carbon/plants")
      .then(res => res.ok ? res.json() : [])
      .then(list => {
        if (list.length > 0) {
          setPlantsList(list);
          if (!list.includes(selectedPlant)) {
            setSelectedPlant(list[0]);
          }
        } else {
          setPlantsList(["Bhopal", "Delhi"]);
        }
      })
      .catch(() => setPlantsList(["Bhopal", "Delhi"]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch plant historical data
  useEffect(() => {
    if (!selectedPlant) return;
    setLoading(true);
    console.log(`[DEBUG] Frontend requesting forecasting data for plant: "${selectedPlant}"`);
    fetch(`http://localhost:5000/api/carbon/plant-data/${encodeURIComponent(selectedPlant)}`)
      .then(res => {
        console.log(`[DEBUG] API Response Status: ${res.status}`);
        return res.ok ? res.json() : [];
      })
      .then(data => {
        console.log(`[DEBUG] Received ${data.length} records from backend`);
        if (Array.isArray(data)) {
          // Sort by year and month ascending
          const sorted = data.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
          });
          const monthsFound = sorted.map(d => `${d.month}/${d.year}`);
          console.log(`[DEBUG] Sorted historical months:`, monthsFound);
          setHistoricalData(sorted);
        } else {
          console.warn("[DEBUG] Received non-array data response");
          setHistoricalData([]);
        }
      })
      .catch((err) => {
        console.error("[DEBUG] Failed to fetch historical data:", err);
        setHistoricalData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedPlant]);

  // Handle Scenario presets
  const applyScenarioPreset = (scenarioName) => {
    setActiveScenario(scenarioName);
    const preset = PRESETS[scenarioName];
    if (preset) {
      setSliderRenewable(preset.renewable);
      setSliderFuel(preset.fuel);
      setSliderElectricity(preset.electricity);
      setSliderProduction(preset.production);
      setSliderOffset(preset.offset);
      setSliderEfficiency(preset.efficiency);
    }
  };

  // Trigger apply scenario once plant data changes
  useEffect(() => {
    if (historicalData.length >= 6) {
      applyScenarioPreset("Green Transition");
    }
  }, [historicalData]);

  const hasSufficientData = historicalData.length >= 6;

  // Baseline Extraction
  const getBaseline = () => {
    if (historicalData.length === 0) {
      return {
        production: 5000000, grid: 240000, renewable: 45000, solar: 18000,
        totalElectricity: 303000, lpg: 2200, furnace: 7500, png: 3800,
        hsd: 14000, biomass: 11000, carbonMT: 200, energyMJ: 1200000,
        renewablePercent: 20, carbonIntensity: 0.04, credits: 100, compliance: 50
      };
    }

    // Average of latest up to 12 records
    const numEntries = Math.min(12, historicalData.length);
    const startIdx = historicalData.length - numEntries;
    const slice = historicalData.slice(startIdx);

    const sum = slice.reduce((acc, curr) => {
      const inputs = curr.inputs || {};
      const p = inputs.powerConsumption || {};
      const f = inputs.fuelConsumption || {};
      const k = curr.kpis || {};

      acc.production += inputs.beverageProduction || inputs.production || 0;
      acc.grid += p.gridPowerKWh || 0;
      acc.renewable += p.renewablePowerKWh || 0;
      acc.solar += p.solarPowerKWh || 0;
      
      acc.lpg += f.lpgKg || 0;
      acc.furnace += f.furnaceOilLitre || 0;
      acc.png += (f.pngSCM || f.pngScm || 0);
      acc.hsd += f.hsdLitre || 0;
      acc.biomass += (f.biomassMJ || f.biomassMj || 0);

      acc.carbonMT += k.totalCarbonMT ? parseFloat(k.totalCarbonMT) : 0;
      acc.energyMJ += k.totalEnergyMJ || 0;
      return acc;
    }, {
      production: 0, grid: 0, renewable: 0, solar: 0,
      lpg: 0, furnace: 0, png: 0, hsd: 0, biomass: 0,
      carbonMT: 0, energyMJ: 0
    });

    const baseline = {
      production: sum.production / numEntries,
      grid: sum.grid / numEntries,
      renewable: sum.renewable / numEntries,
      solar: sum.solar / numEntries,
      totalElectricity: (sum.grid + sum.renewable + sum.solar) / numEntries,
      lpg: sum.lpg / numEntries,
      furnace: sum.furnace / numEntries,
      png: sum.png / numEntries,
      hsd: sum.hsd / numEntries,
      biomass: sum.biomass / numEntries,
      carbonMT: sum.carbonMT / numEntries,
      energyMJ: sum.energyMJ / numEntries
    };

    baseline.renewablePercent = baseline.totalElectricity > 0
      ? ((baseline.renewable + baseline.solar) / baseline.totalElectricity) * 100
      : 0;
    
    baseline.carbonIntensity = (baseline.carbonMT * 1000) / (baseline.production || 1);

    const greenCredit = Math.round((baseline.renewable + baseline.solar) * 0.05);
    const bioCredit = Math.round(baseline.biomass * 0.01);
    baseline.credits = greenCredit + bioCredit;

    let compliance = 50;
    if (baseline.renewablePercent >= 25) compliance += 25;
    else compliance += (baseline.renewablePercent / 25) * 25;
    if (baseline.biomass > 0) compliance += 15;
    if (baseline.carbonIntensity < 0.08) compliance += 10;
    baseline.compliance = Math.min(99, Math.round(compliance));

    return baseline;
  };

  const baseline = getBaseline();

  // Slope calculation
  const getSlopes = () => {
    if (!hasSufficientData) {
      return { production: 0, electricity: 0, fuel: 0, emissions: 0 };
    }

    const trendProd = calculateLinearTrend(historicalData, d => d.inputs?.beverageProduction || d.inputs?.production || 0);
    const trendElec = calculateLinearTrend(historicalData, d => {
      const p = d.inputs?.powerConsumption || {};
      return (p.gridPowerKWh || 0) + (p.renewablePowerKWh || 0) + (p.solarPowerKWh || 0);
    });
    const trendFuel = calculateLinearTrend(historicalData, d => {
      const f = d.inputs?.fuelConsumption || {};
      return (f.lpgKg || 0) + (f.furnaceOilLitre || 0) + (f.pngSCM || f.pngScm || 0) + (f.hsdLitre || 0) + (f.biomassMJ || f.biomassMj || 0);
    });
    const trendEmissions = calculateLinearTrend(historicalData, d => d.kpis?.totalCarbonMT ? parseFloat(d.kpis.totalCarbonMT) : 0);

    return {
      production: trendProd.slope * 12,
      electricity: trendElec.slope * 12,
      fuel: trendFuel.slope * 12,
      emissions: trendEmissions.slope * 12
    };
  };

  const slopes = getSlopes();

  // Dynamic projection calculations
  const projectDataPoints = (sliders, baselineData, slopesData) => {
    const currentYear = new Date().getFullYear();
    const dataPoints = [];

    for (let y = 1; y <= 10; y++) {
      const yearLabel = currentYear + y;
      
      const trendProduction = Math.max(0, baselineData.production + slopesData.production * y);
      const prodGrowthFactor = 1 + (sliders.production / 100);
      const projProduction = trendProduction * prodGrowthFactor;
      
      const trendElectricity = Math.max(0, baselineData.totalElectricity + slopesData.electricity * y);
      const electricitySliderFactor = 1 + (sliders.electricity / 100);
      const efficiencyReduction = Math.max(0.4, 1 - (sliders.efficiency / 100));
      const projElectricity = trendElectricity * electricitySliderFactor * efficiencyReduction;

      const projRenewable = projElectricity * (sliders.renewable / 100);
      const projGrid = projElectricity * (1 - sliders.renewable / 100);

      const trendFuelSum = Math.max(0, (baselineData.lpg + baselineData.furnace + baselineData.png + baselineData.hsd + baselineData.biomass) + slopesData.fuel * y);
      const fuelSliderFactor = 1 + (sliders.fuel / 100);
      const fuelFactor = fuelSliderFactor * efficiencyReduction;
      
      const baselineFuelSum = (baselineData.lpg + baselineData.furnace + baselineData.png + baselineData.hsd + baselineData.biomass) || 1;
      const trendFuelRatio = trendFuelSum / baselineFuelSum;

      const projLpg = baselineData.lpg * trendFuelRatio * fuelFactor;
      const projFurnace = baselineData.furnace * trendFuelRatio * fuelFactor;
      const projPng = baselineData.png * trendFuelRatio * fuelFactor;
      const projHsd = baselineData.hsd * trendFuelRatio * fuelFactor;
      const projBiomass = baselineData.biomass * trendFuelRatio * fuelFactor;

      const gridEmissions = projGrid * FACTORS.GRID_CO2;
      const fuelEmissions = projLpg * FACTORS.LPG_CO2 + projFurnace * FACTORS.FURNACE_CO2 + projPng * FACTORS.PNG_CO2 + projHsd * FACTORS.HSD_CO2;
      const offsetReduces = sliders.offset * 25; // ₹1 Lakh investment = 25 MT neutralized
      
      const rawCarbonMT = (gridEmissions + fuelEmissions) / 1000;
      const carbonMT = Math.max(0, rawCarbonMT - offsetReduces);
      const carbonIntensity = (carbonMT * 1000) / (projProduction || 1);

      const greenCredit = Math.round(projRenewable * 0.05);
      const bioCredit = Math.round(projBiomass * 0.01);
      const offsetCredit = sliders.offset * 50;
      const credits = Math.round(greenCredit + bioCredit + offsetCredit);

      const projEnergyMJ = projElectricity * FACTORS.KWH_TO_MJ + projLpg * FACTORS.LPG_TO_MJ + projFurnace * FACTORS.FURNACE_TO_MJ + projPng * FACTORS.PNG_TO_MJ + projHsd * FACTORS.HSD_TO_MJ + projBiomass;
      const bauEnergyMJ = baselineData.energyMJ * prodGrowthFactor;
      const energySavingsMJ = Math.max(0, bauEnergyMJ - projEnergyMJ);

      const bauElectricity = baselineData.totalElectricity * electricitySliderFactor;
      const bauGridCost = bauElectricity * 8;
      const bauFuelCost = (baselineData.lpg * 80 + baselineData.furnace * 60 + baselineData.png * 50 + baselineData.hsd * 90) * fuelSliderFactor;
      const bauTotalCost = bauGridCost + bauFuelCost;

      const projGridCost = projGrid * 8;
      const projRenewableCost = projRenewable * 4.2;
      const projFuelCost = (projLpg * 80 + projFurnace * 60 + projPng * 50 + projHsd * 90);
      const actualTotalCost = projGridCost + projRenewableCost + projFuelCost;
      const costSavings = Math.max(0, bauTotalCost - actualTotalCost);

      const renewPercent = sliders.renewable;
      let compliance = 50;
      if (renewPercent >= 30) compliance += 25;
      else compliance += (renewPercent / 30) * 25;
      if (projBiomass > 0) compliance += 15;
      if (carbonIntensity < 0.07) compliance += 10;
      compliance = Math.min(99, Math.round(compliance));

      dataPoints.push({
        year: yearLabel,
        production: projProduction,
        emissions: carbonMT,
        intensity: carbonIntensity,
        credits,
        energySavingsMJ,
        costSavings,
        compliance,
        renewPercent
      });
    }

    return dataPoints;
  };

  const projections = projectDataPoints({
    renewable: sliderRenewable,
    fuel: sliderFuel,
    electricity: sliderElectricity,
    production: sliderProduction,
    offset: sliderOffset,
    efficiency: sliderEfficiency
  }, baseline, slopes);

  // Get index corresponding to selected duration
  const getTargetProj = () => {
    if (duration === 3) return projections[2];
    if (duration === 10) return projections[9];
    return projections[4]; // Default 5 years
  };

  const targetProj = getTargetProj();

  // Dynamic ESG Score Calculation
  const getEsgScore = () => {
    const renewWeight = sliderRenewable * 0.3;
    const complianceWeight = targetProj.compliance * 0.3;
    const reductionPercent = Math.max(0, ((baseline.carbonMT - targetProj.emissions) / (baseline.carbonMT || 1)) * 100);
    const reductionWeight = Math.min(100, reductionPercent) * 0.3;
    const creditsWeight = Math.min(100, (targetProj.credits / 200) * 100) * 0.1;
    return Math.min(99, Math.round(renewWeight + complianceWeight + reductionWeight + creditsWeight));
  };

  const esgScore = getEsgScore();

  // Dynamic AI executive summary
  const getSummary = () => {
    const savingsLakhs = (targetProj.costSavings / 100000).toFixed(1);
    const reductionPercent = Math.max(0, ((baseline.carbonMT - targetProj.emissions) / (baseline.carbonMT || 1)) * 100).toFixed(0);
    
    return `Based on predictive carbon models, ${selectedPlant} Plant is projected to reduce greenhouse emissions by approximately ${reductionPercent}% within the next ${duration} years, lowering annual output to ${targetProj.emissions.toFixed(1)} MT CO₂e. By implementing your energy efficiency targets (${sliderEfficiency}%) and expanding renewable PPA options to ${sliderRenewable}%, the plant will generate an estimated ${targetProj.credits.toLocaleString()} carbon credits, while achieving ₹${savingsLakhs} Lakhs in cumulative utility cost savings.`;
  };

  // Dynamic AI recommendation engine
  const getRecommendations = () => {
    const list = [];
    if (sliderRenewable < 55) {
      list.push({
        title: "Aggressive Solar PPA Procurement",
        desc: `Switching to a hybrid solar/wind PPA to hit at least 55% renewable energy will lower grid reliance and offset emissions by an estimated ${(baseline.grid * 0.4 * 0.82 / 1000).toFixed(1)} MT CO₂e annually.`,
        impact: "High Impact"
      });
    }
    if (sliderEfficiency < 20) {
      list.push({
        title: "Smart Motor Controllers & HVAC Upgrades",
        desc: "Upgrading key factory ventilation and pump systems is projected to increase energy efficiency, lowering baseline power draw by 12% with a 1.8 year ROI.",
        impact: "Medium Impact"
      });
    }
    if (baseline.hsd > 8000 && sliderFuel > -10) {
      list.push({
        title: "Green Logistics & Biomass Boiler Conversion",
        desc: `Replacing furnace boilers with a localized biomass system would reduce Scope 1 direct emissions, yielding up to ${Math.round(baseline.hsd * 0.08)} additional green carbon credits.`,
        impact: "High Impact"
      });
    }
    if (sliderOffset < 15) {
      list.push({
        title: "Clean Development Offset Investment",
        desc: "Allocating ₹15 Lakhs into certified forestry offsets will immediately help the plant reach regulatory compliance score targets and offset legacy Scope 1 footprint values.",
        impact: "Regulatory Compliance"
      });
    }
    return list;
  };

  // Environmental Impact Equivalents
  const getEquivalents = () => {
    const totalReduction = Math.max(0, baseline.carbonMT - targetProj.emissions);
    return {
      trees: Math.round(totalReduction * 45), // 1 ton = 45 trees
      cars: Math.round(totalReduction * 0.22), // 1 ton = 0.22 passenger cars
      homes: Math.round((targetProj.energySavingsMJ / 3.6) * 0.08), // energy saved equivalent homes
      coal: Math.round(totalReduction * 0.5) // coal avoided in tons
    };
  };

  const equiv = getEquivalents();

  // Chart configuration for projections
  const getChartOptions = () => {
    const currentYear = new Date().getFullYear();
    const yearsArray = [currentYear, ...projections.map(p => p.year)];
    
    // Projections calculated dynamically for scenario benchmarks
    const currentOperationsProj = projectDataPoints(PRESETS["Current Operations"], baseline, slopes);
    const netZeroProj = projectDataPoints(PRESETS["Net Zero Roadmap"], baseline, slopes);

    // BAU Emissions trend (Current operations trendline)
    const bauEmissions = [
      baseline.carbonMT,
      ...currentOperationsProj.map(p => p.emissions)
    ];

    // Predicted trend (slider adjustments)
    const predEmissions = [
      baseline.carbonMT,
      ...projections.map(p => p.emissions)
    ];

    // Compliance Target trend (declines 3.5% annually)
    const targetEmissions = [
      baseline.carbonMT,
      ...projections.map((p, i) => baseline.carbonMT * Math.max(0.3, 1 - (0.035 * (i + 1))))
    ];

    // Net Zero emissions path (dynamically forecasted)
    const netZeroEmissions = [
      baseline.carbonMT,
      ...netZeroProj.map(p => p.emissions)
    ];

    return {
      series: [
        { name: "Current Trend (BAU)", data: bauEmissions.map(v => parseFloat(v.toFixed(1))) },
        { name: "Predicted Trend (AI)", data: predEmissions.map(v => parseFloat(v.toFixed(1))) },
        { name: "Target Emissions", data: targetEmissions.map(v => parseFloat(v.toFixed(1))) },
        { name: "Net Zero Goal", data: netZeroEmissions.map(v => parseFloat(v.toFixed(1))) }
      ],
      chart: {
        type: "line",
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "'Inter', sans-serif"
      },
      colors: ["#64748b", "#10b981", "#3b82f6", "#ef4444"], // Grey, Green, Blue, Red
      stroke: {
        width: [3, 4, 2, 2],
        curve: "smooth",
        dashArray: [5, 0, 4, 4]
      },
      markers: {
        size: 4,
        hover: { size: 7 }
      },
      xaxis: {
        categories: yearsArray,
        labels: { style: { colors: "#475569", fontWeight: 600 } }
      },
      yaxis: {
        title: { text: "CO₂ Emissions (MT)", style: { color: "#475569", fontWeight: 600 } },
        labels: { style: { colors: "#475569", fontWeight: 600 } }
      },
      grid: {
        borderColor: "rgba(226, 232, 240, 0.6)",
        strokeDasharray: 4
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        labels: { colors: "#475569" },
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600
      },
      tooltip: {
        shared: true,
        theme: "light",
        y: { formatter: (v) => `${v} MT` }
      }
    };
  };

  // Compare scenarios table data
  const getScenarioComparison = () => {
    const baselineEmissions = baseline.carbonMT;

    const currentProj = projectDataPoints(PRESETS["Current Operations"], baseline, slopes)[4];
    const renewableProj = projectDataPoints(PRESETS["Renewable Energy Expansion"], baseline, slopes)[4];
    const greenProj = projectDataPoints(PRESETS["Green Transition"], baseline, slopes)[4];
    const netZeroProj = projectDataPoints(PRESETS["Net Zero Roadmap"], baseline, slopes)[4];
    const customProj = projections[4]; // current active sliders

    const getRedPct = (em) => {
      const diff = baselineEmissions - em;
      if (diff <= 0) return "0%";
      return `${((diff / baselineEmissions) * 100).toFixed(0)}%`;
    };

    return [
      { name: "Current Operations", emissions: currentProj.emissions, reduction: getRedPct(currentProj.emissions), credits: currentProj.credits, costSavings: currentProj.costSavings, compliance: currentProj.compliance, active: activeScenario === "Current Operations" },
      { name: "Renewable Expansion", emissions: renewableProj.emissions, reduction: getRedPct(renewableProj.emissions), credits: renewableProj.credits, costSavings: renewableProj.costSavings, compliance: renewableProj.compliance, active: activeScenario === "Renewable Energy Expansion" },
      { name: "Green Transition", emissions: greenProj.emissions, reduction: getRedPct(greenProj.emissions), credits: greenProj.credits, costSavings: greenProj.costSavings, compliance: greenProj.compliance, active: activeScenario === "Green Transition" },
      { name: "Net Zero Strategy", emissions: netZeroProj.emissions, reduction: getRedPct(netZeroProj.emissions), credits: netZeroProj.credits, costSavings: netZeroProj.costSavings, compliance: netZeroProj.compliance, active: activeScenario === "Net Zero Roadmap" },
      { name: "Custom Strategy (Active)", emissions: customProj.emissions, reduction: getRedPct(customProj.emissions), credits: customProj.credits, costSavings: customProj.costSavings, compliance: customProj.compliance, active: activeScenario === "Custom Scenario" }
    ];
  };

  const comparisonData = getScenarioComparison();
  const currentYear = new Date().getFullYear();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 60 }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 12, margin: 0, fontSize: 28, fontWeight: 900, color: "#0f172a" }}>
            <FiCpu color="#0f766e" /> AI Prediction & Forecasting
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 15, fontWeight: 500 }}>
            Carbon intelligence, predictive scenario mapping, and net zero roadmap planning.
          </p>
        </div>
        
        {/* Plant selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "white", padding: "8px 16px", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <FiMapPin color="#0f766e" />
          <span style={{ fontWeight: 700, color: "#475569" }}>Plant Node:</span>
          <select 
            value={selectedPlant} 
            onChange={e => {
              setSelectedPlant(e.target.value);
              localStorage.setItem("plant", e.target.value);
            }}
            style={{ border: "none", outline: "none", fontWeight: 800, color: "#0f766e", cursor: "pointer", background: "transparent" }}
          >
            {plantsList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 120, color: "#0f766e" }}>
          <FiLoader size={48} style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
          <h3>Running AI forecasting engine...</h3>
          <style dangerouslySetInnerHTML={{ __html: "@keyframes spin { 100% { transform: rotate(360deg); } }" }} />
        </div>
      ) : !hasSufficientData ? (
        <div style={{
          background: "white",
          padding: "80px 40px",
          borderRadius: "24px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px"
        }}>
          <FiAlertCircle size={48} color="#ef4444" />
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
            Insufficient Historical Data
          </h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: "15px", maxWidth: "480px", lineHeight: "1.6", fontWeight: 500 }}>
            At least six months of historical operational data are required to generate an accurate prediction. 
            Currently, only {historicalData.length} {historicalData.length === 1 ? 'month' : 'months'} of records are available for the {selectedPlant} plant.
          </p>
        </div>
      ) : (
        <>
          {/* SECTION 1: PREDICTION CONTROLS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, alignItems: "stretch" }} className="predict-grid">
            
            {/* Scenarios Preset panel */}
            <div className="glass-panel" style={panelStyle}>
              <h3 style={panelTitleStyle}><FiCompass /> Scenario Presets</h3>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: -12, marginBottom: 20 }}>Select a strategic scenario model to instantly apply target slider parameters.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { name: "Current Operations", desc: "No strategic efficiency gains or offsets", icon: <FiTrendingUp color="#ef4444" /> },
                  { name: "Green Transition", desc: "Balanced PPA switch & baseline savings", icon: <FiCompass color="#10b981" /> },
                  { name: "Renewable Energy Expansion", desc: "Major shift toward green electricity PPA", icon: <FiSun color="#eab308" /> },
                  { name: "Aggressive Carbon Reduction", desc: "Heavy fuel offset & offset investments", icon: <FiTarget color="#3b82f6" /> },
                  { name: "Net Zero Roadmap", desc: "Complete replacement of grid and high fuel cuts", icon: <FiShield color="#8b5cf6" /> },
                  { name: "Custom Scenario", desc: "Manually adjust values for custom targets", icon: <FiSliders color="#64748b" /> }
                ].map(s => {
                  const isActive = activeScenario === s.name;
                  return (
                    <div 
                      key={s.name} 
                      onClick={() => applyScenarioPreset(s.name)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: isActive ? "linear-gradient(135deg, #0f766e, #14b8a6)" : "#f8fafc",
                        color: isActive ? "white" : "#0f172a",
                        border: isActive ? "none" : "1px solid #e2e8f0",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13 }}>
                        {isActive ? <FiCheckCircle color="white" /> : s.icon} {s.name}
                      </div>
                      <div style={{ fontSize: 11, opacity: isActive ? 0.9 : 0.6, fontWeight: 500, lineHeight: 1.4 }}>{s.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sliders panel */}
            <div className="glass-panel" style={panelStyle}>
              <h3 style={panelTitleStyle}><FiSliders /> Simulation Sliders</h3>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: -12, marginBottom: 20 }}>Adjust parameters dynamically. This forces custom scenario modes.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* Slider 1 */}
                <div style={sliderRowStyle}>
                  <div style={sliderHeaderStyle}>
                    <span style={sliderLabelStyle}><FiSun color="#eab308" /> Renewable Energy %</span>
                    <span style={sliderValueStyle}>{sliderRenewable}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={sliderRenewable} 
                    onChange={e => {
                      setSliderRenewable(Number(e.target.value));
                      setActiveScenario("Custom Scenario");
                    }}
                    style={sliderInputStyle}
                  />
                </div>

                {/* Slider 2 */}
                <div style={sliderRowStyle}>
                  <div style={sliderHeaderStyle}>
                    <span style={sliderLabelStyle}><FiActivity color="#ef4444" /> Fuel Consumption Change</span>
                    <span style={sliderValueStyle}>{sliderFuel > 0 ? `+${sliderFuel}` : sliderFuel}%</span>
                  </div>
                  <input 
                    type="range" min="-50" max="50" 
                    value={sliderFuel} 
                    onChange={e => {
                      setSliderFuel(Number(e.target.value));
                      setActiveScenario("Custom Scenario");
                    }}
                    style={sliderInputStyle}
                  />
                </div>

                {/* Slider 3 */}
                <div style={sliderRowStyle}>
                  <div style={sliderHeaderStyle}>
                    <span style={sliderLabelStyle}><FiZap color="#3b82f6" /> Electricity Consumption Change</span>
                    <span style={sliderValueStyle}>{sliderElectricity > 0 ? `+${sliderElectricity}` : sliderElectricity}%</span>
                  </div>
                  <input 
                    type="range" min="-50" max="50" 
                    value={sliderElectricity} 
                    onChange={e => {
                      setSliderElectricity(Number(e.target.value));
                      setActiveScenario("Custom Scenario");
                    }}
                    style={sliderInputStyle}
                  />
                </div>

                {/* Slider 4 */}
                <div style={sliderRowStyle}>
                  <div style={sliderHeaderStyle}>
                    <span style={sliderLabelStyle}><FiTrendingUp color="#10b981" /> Production Capacity Growth</span>
                    <span style={sliderValueStyle}>{sliderProduction > 0 ? `+${sliderProduction}` : sliderProduction}%</span>
                  </div>
                  <input 
                    type="range" min="-50" max="50" 
                    value={sliderProduction} 
                    onChange={e => {
                      setSliderProduction(Number(e.target.value));
                      setActiveScenario("Custom Scenario");
                    }}
                    style={sliderInputStyle}
                  />
                </div>

                {/* Slider 5 */}
                <div style={sliderRowStyle}>
                  <div style={sliderHeaderStyle}>
                    <span style={sliderLabelStyle}><FiShield color="#8b5cf6" /> Carbon Offset Investment</span>
                    <span style={sliderValueStyle}>₹{sliderOffset} Lakhs</span>
                  </div>
                  <input 
                    type="range" min="0" max="50" 
                    value={sliderOffset} 
                    onChange={e => {
                      setSliderOffset(Number(e.target.value));
                      setActiveScenario("Custom Scenario");
                    }}
                    style={sliderInputStyle}
                  />
                </div>

                {/* Slider 6 */}
                <div style={sliderRowStyle}>
                  <div style={sliderHeaderStyle}>
                    <span style={sliderLabelStyle}><FiTarget color="#14b8a6" /> Energy Efficiency Improvement %</span>
                    <span style={sliderValueStyle}>{sliderEfficiency}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="50" 
                    value={sliderEfficiency} 
                    onChange={e => {
                      setSliderEfficiency(Number(e.target.value));
                      setActiveScenario("Custom Scenario");
                    }}
                    style={sliderInputStyle}
                  />
                </div>

              </div>
            </div>

          </div>

          {/* SECTION 2: CURRENT BASELINE VS FUTURE FORECAST */}
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 30 }} className="baseline-grid">
            
            {/* Current Baseline column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "#f8fafc", padding: 24, borderRadius: 16, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: 13, color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>Current Baseline</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <MiniStat label="Current Carbon" val={`${baseline.carbonMT.toFixed(1)} MT`} color="#ef4444" />
                  <MiniStat label="Carbon Intensity" val={`${baseline.carbonIntensity.toFixed(3)} kg/L`} color="#f59e0b" />
                  <MiniStat label="Renewable Mix" val={`${baseline.renewablePercent.toFixed(1)}%`} color="#10b981" />
                  <MiniStat label="Carbon Credits" val={`${baseline.credits} Credits`} color="#06b6d4" />
                  <MiniStat label="Compliance Score" val={`${baseline.compliance}%`} color="#8b5cf6" />
                </div>
              </div>
            </div>

            {/* Projections display columns */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Duration selector */}
              <div style={{ display: "flex", gap: 8, alignSelf: "flex-end" }}>
                {[3, 5, 10].map(yr => (
                  <button 
                    key={yr} 
                    onClick={() => setDuration(yr)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      background: duration === yr ? "#0f766e" : "white",
                      color: duration === yr ? "white" : "#475569",
                      border: "1px solid #cbd5e1",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 13
                    }}
                  >
                    After {yr} Years
                  </button>
                ))}
              </div>

              {/* Projections Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                
                <ProjectionCard 
                  title="Estimated CO₂ Output" 
                  value={`${targetProj.emissions.toFixed(1)} MT`} 
                  subText={`vs baseline ${baseline.carbonMT.toFixed(1)}`}
                  trend={targetProj.emissions < baseline.carbonMT ? "down" : "up"}
                  percent={`${Math.abs(((baseline.carbonMT - targetProj.emissions) / (baseline.carbonMT || 1)) * 100).toFixed(0)}% reduction`}
                />

                <ProjectionCard 
                  title="Estimated Cost Savings" 
                  value={`₹${(targetProj.costSavings / 100000).toFixed(1)} Lakhs`} 
                  subText="Utility PPA offsets & efficiency"
                  trend="up"
                  percent="Annual savings"
                />

                <ProjectionCard 
                  title="Projected Credits" 
                  value={`${targetProj.credits.toLocaleString()} Credits`} 
                  subText={`vs baseline ${baseline.credits}`}
                  trend="up"
                  percent={`+${Math.max(0, targetProj.credits - baseline.credits)} compiled`}
                />

              </div>
            </div>

          </div>

          {/* SECTION 4: INTERACTIVE FORECAST GRAPH */}
          <div className="glass-panel" style={panelStyle}>
            <h3 style={panelTitleStyle}><FiTrendingUp /> Multi-Scenario Projections Trendline</h3>
            <ForecastingApexChart options={getChartOptions()} />
          </div>

          {/* SECTION 5: SCENARIO COMPARISON TABLE & SUMMARY */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 30 }} className="table-summary-grid">
            
            {/* Executive summary & recommendations */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Executive Summary */}
              <div style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 13, color: "#0f766e", fontWeight: 800, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  <FiCpu /> AI Executive Summary
                </h4>
                <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6, fontWeight: 500 }}>
                  "{getSummary()}"
                </p>
              </div>

              {/* Recommendations */}
              <div style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: 13, color: "#475569", fontWeight: 800, textTransform: "uppercase" }}>AI Strategic Recommendations</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {getRecommendations().map((r, i) => (
                    <div key={i} style={{ borderBottom: i < getRecommendations().length - 1 ? "1px dashed #cbd5e1" : "none", paddingBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{r.title}</span>
                        <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>{r.impact}</span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Comparison Grid */}
            <div className="glass-panel" style={panelStyle}>
              <h3 style={panelTitleStyle}><FiTarget /> Strategic Scenario Comparison</h3>
              
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #cbd5e1", color: "#475569", fontSize: 12, textTransform: "uppercase" }}>
                    <th style={{ padding: "10px 8px" }}>Scenario</th>
                    <th style={{ padding: "10px 8px" }}>CO₂ Output</th>
                    <th style={{ padding: "10px 8px" }}>Reduction</th>
                    <th style={{ padding: "10px 8px" }}>Credits</th>
                    <th style={{ padding: "10px 8px" }}>Cost Savings</th>
                    <th style={{ padding: "10px 8px" }}>Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map(c => (
                    <tr 
                      key={c.name}
                      style={{ 
                        borderBottom: "1px solid #e2e8f0", 
                        fontSize: 13, 
                        fontWeight: c.active ? 800 : 500,
                        background: c.active ? "rgba(16, 185, 129, 0.05)" : "transparent"
                      }}
                    >
                      <td style={{ padding: "12px 8px", color: c.active ? "#0f766e" : "#0f172a" }}>
                        {c.name} {c.active && "⭐"}
                      </td>
                      <td style={{ padding: "12px 8px" }}>{c.emissions.toFixed(1)} MT</td>
                      <td style={{ padding: "12px 8px", color: c.emissions < baseline.carbonMT ? "#10b981" : "#ef4444", fontWeight: 700 }}>{c.reduction}</td>
                      <td style={{ padding: "12px 8px" }}>{c.credits.toLocaleString()}</td>
                      <td style={{ padding: "12px 8px" }}>₹{(c.costSavings / 100000).toFixed(1)}L</td>
                      <td style={{ padding: "12px 8px", fontWeight: 700, color: c.compliance >= 70 ? "#0f766e" : "#f59e0b" }}>{c.compliance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* SECTION 8: ENVIRONMENTAL EQUIVALENT METRICS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }} className="equiv-grid">
            
            <EquivCard 
              icon={<FaTree />} 
              label="Forest carbon Offset" 
              val={`${equiv.trees.toLocaleString()} Trees`} 
              desc="Equivalent trees growing for 10 years" 
              color="#10b981" 
            />

            <EquivCard 
              icon={<FaCar />} 
              label="Emissions Avoided" 
              val={`${equiv.cars.toLocaleString()} Cars`} 
              desc="Passenger vehicles offset for 1 year" 
              color="#ef4444" 
            />

            <EquivCard 
              icon={<FaBolt />} 
              label="Clean Coal Avoided" 
              val={`${equiv.coal.toLocaleString()} Tons`} 
              desc="Tons of coal combustion prevented" 
              color="#f59e0b" 
            />

            <EquivCard 
              icon={<FaLeaf />} 
              label="Clean Power Generated" 
              val={`${(targetProj.energySavingsMJ / 3.6).toLocaleString(undefined, {maximumFractionDigits: 0})} kWh`} 
              desc="Clean electricity offset compile rate" 
              color="#06b6d4" 
            />

          </div>

          {/* SECTION 9: RISK & COMPLIANCE ASSESSMENT */}
          <div className="glass-panel" style={panelStyle}>
            <h3 style={panelTitleStyle}><FiShield /> Executive Risk & Compliance Index</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }} className="compliance-progress-grid">
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ProgressBar label="ESG Disclosure Readiness" val={esgScore} color="#10b981" />
                <ProgressBar label="Regulatory Compliance Index" val={targetProj.compliance} color="#0f766e" />
                <ProgressBar label="Grid Dependency Offsets" val={sliderRenewable} color="#3b82f6" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ProgressBar label="Net Zero Milestone Alignment" val={sliderRenewable === 100 ? 99 : Math.round(sliderRenewable * 0.9)} color="#8b5cf6" />
                <ProgressBar label="Carbon Credit Compiling Rate" val={Math.min(99, Math.round((targetProj.credits / 1000) * 105))} color="#06b6d4" />
                <ProgressBar label="Baseline Excess Carbon Risk" val={Math.max(10, 100 - targetProj.compliance)} color="#ef4444" />
              </div>

            </div>
          </div>

          {/* SECTION 7: SUSTAINABILITY ROADMAP TIMELINE */}
          <div className="glass-panel" style={panelStyle}>
            <h3 style={panelTitleStyle}><FiCompass /> Strategic Sustainability Roadmap</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", flexWrap: "wrap", gap: 20 }} className="roadmap-flex">
              
              {/* Dashed line connecting nodes on wide displays */}
              <div style={{ position: "absolute", top: "24px", left: "10%", right: "10%", height: "2px", borderTop: "2px dashed #cbd5e1", zIndex: 1 }} className="roadmap-connector" />
              
              {[
                { yr: String(currentYear), task: "Current State Baseline", desc: `${baseline.carbonMT.toFixed(1)} MT Carbon output`, active: true },
                { yr: String(currentYear + 1), task: "PPA Contracting Switch", desc: `Initiate ${sliderRenewable}% renewables target`, active: sliderRenewable >= 25 },
                { yr: String(currentYear + 2), task: "Energy Efficiency Upgrades", desc: `Reach ${sliderEfficiency}% consumption offset`, active: sliderEfficiency >= 10 },
                { yr: String(currentYear + 3), task: "Credit Monetization", desc: `${targetProj.credits.toLocaleString()} compiled offsets`, active: targetProj.credits >= 400 },
                { yr: String(currentYear + 4), task: "Biomass boiler Conversion", desc: "Offset direct combustion fuels", active: sliderFuel <= -10 },
                { yr: String(currentYear + 6), task: "Net Zero Readiness Status", desc: "Maintain regulatory compliant scores", active: sliderRenewable === 100 }
              ].map((n, idx) => (
                <div 
                  key={idx}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 2
                  }}
                >
                  <div 
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: n.active ? "linear-gradient(135deg, #0f766e, #14b8a6)" : "#e2e8f0",
                      color: n.active ? "white" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 800,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                      marginBottom: 12,
                      border: "4px solid white"
                    }}
                  >
                    {n.yr}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: n.active ? "#0f766e" : "#475569", marginBottom: 4 }}>{n.task}</div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.3 }}>{n.desc}</div>
                </div>
              ))}

            </div>
          </div>

        </>
      )}

    </div>
  );
}

// STYLING PRESETS
const panelStyle = {
  background: "white",
  padding: 26,
  borderRadius: 20,
  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)",
  border: "1px solid rgba(226, 232, 240, 0.8)"
};

const panelTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "0 0 20px 0",
  fontSize: 17,
  fontWeight: 800,
  color: "#0f172a"
};

const sliderRowStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const sliderHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const sliderLabelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  display: "flex",
  alignItems: "center",
  gap: 6
};

const sliderValueStyle = {
  fontSize: 13,
  fontWeight: 800,
  color: "#0f766e"
};

const sliderInputStyle = {
  width: "100%",
  accentColor: "#0f766e",
  cursor: "pointer"
};

// MINI COMPONENTS
function MiniStat({ label, val, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: 10 }}>
      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, color, fontWeight: 800 }}>{val}</span>
    </div>
  );
}

function ProjectionCard({ title, value, subText, percent, trend }) {
  const isDown = trend === "down";
  return (
    <div style={{ ...panelStyle, flex: 1, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>{title}</div>
      
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>{value}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontWeight: 500 }}>{subText}</div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 12, fontWeight: 700, color: isDown ? "#10b981" : "#ef4444" }}>
        {isDown ? <FiTrendingDown /> : <FiTrendingUp />} {percent}
      </div>
    </div>
  );
}

function EquivCard({ icon, label, val, desc, color }) {
  return (
    <div style={{ ...panelStyle, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ background: `${color}15`, color, width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{val}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>{desc}</div>
      </div>
    </div>
  );
}

function ProgressBar({ label, val, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#475569" }}>
        <span>{label}</span>
        <span>{val}%</span>
      </div>
      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${val}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.3s ease-in-out" }} />
      </div>
    </div>
  );
}

const ForecastingApexChart = memo(({ options }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (instance.current) {
      instance.current.destroy();
    }

    instance.current = new ApexCharts(ref.current, options);
    instance.current.render();

    return () => {
      if (instance.current) {
        instance.current.destroy();
        instance.current = null;
      }
    };
  }, [options]);

  return <div ref={ref} style={{ width: "100%", height: 350 }} />;
});
