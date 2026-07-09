// Shared Report Export Service for PDF and Excel generation

/**
 * Triggers the browser print dialog, swapping live interactive canvas charts 
 * with static base64 serialized images for high-fidelity PDF output.
 * 
 * @param {string} serializedImage - The base64 dataURI of the chart.
 * @param {function} setChartImage - React state setter for the chart image.
 * @param {function} setIsPrinting - React state setter for the print flag.
 */
export const triggerPrintFlow = (serializedImage, setChartImage, setIsPrinting) => {
  setChartImage(serializedImage);
  setIsPrinting(true);
  
  // Allow DOM state update to render static image before opening print window
  setTimeout(() => {
    window.print();
    setIsPrinting(false);
    setChartImage(null);
  }, 100);
};

/**
 * Generates and downloads a multi-sheet formatted Excel workbook using ExcelJS.
 * 
 * @param {object} reportData - The aggregated report metrics.
 * @param {string} selectedPlant - The current plant node.
 * @param {string} selectedReport - Category name of the report.
 * @param {string} periodLabel - Month/quarter/year descriptor.
 * @param {number} year - The target calendar year.
 */
export const generateExcel = async (reportData, selectedPlant, selectedReport, periodLabel, year) => {
  const ExcelJS = (await import("exceljs")).default || await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SmartCarbonTrack";

  const totalPower = reportData.power.grid + reportData.power.renew + reportData.power.solar;
  const renewRatio = totalPower > 0 ? ((reportData.power.renew + reportData.power.solar) / totalPower * 100).toFixed(1) : 0;
  const intensity = reportData.prod > 0 ? (reportData.carbon / reportData.prod).toFixed(4) : 0;
  
  const s1_hsd = (reportData.fuel.hsd * 2.68) / 1000;
  const s1_fur = (reportData.fuel.fur * 2.68) / 1000;
  const s1_lpg = (reportData.fuel.lpg * 2.98) / 1000;
  const s1_png = (reportData.fuel.png * 2.02) / 1000;
  const s1_bio = (reportData.fuel.bio * 0.05) / 1000;
  const scope1 = s1_hsd + s1_fur + s1_lpg + s1_png + s1_bio;
  const scope2 = (reportData.power.grid * 0.82) / 1000;
  const totalEmissions = scope1 + scope2;

  const headerFont = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } };
  const titleFont = { name: "Segoe UI", size: 16, bold: true, color: { argb: "FF0F766E" } };
  const boldFont = { name: "Segoe UI", size: 11, bold: true };
  const regularFont = { name: "Segoe UI", size: 11 };
  
  const thinBorder = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } }
  };

  const styleRow = (row, isHeader = false) => {
    row.eachCell((cell) => {
      cell.font = isHeader ? headerFont : regularFont;
      if (isHeader) cell.fill = headerFill;
      cell.border = thinBorder;
      cell.alignment = { vertical: "middle", wrapText: true };
    });
  };

  // 1. Executive Summary
  const ws1 = workbook.addWorksheet("Executive Summary");
  ws1.columns = [
    { header: "Metric / Metadata", key: "metric", width: 35 },
    { header: "Value", key: "value", width: 22 },
    { header: "Unit", key: "unit", width: 15 }
  ];
  ws1.insertRow(1, ["SmartCarbonTrack Executive Report", "", ""]);
  ws1.getRow(1).getCell(1).font = titleFont;
  ws1.mergeCells("A1:C1");
  ws1.insertRow(2, []);
  
  ws1.addRow(["Plant Location", selectedPlant, ""]);
  ws1.addRow(["Reporting Period", periodLabel, ""]);
  ws1.addRow(["Report Category", selectedReport, ""]);
  ws1.addRow(["Generation Date", new Date().toLocaleDateString(), ""]);
  ws1.addRow([]);
  
  const summaryHeader = ws1.addRow(["Summary KPI Metric", "Calculated Value", "Unit"]);
  styleRow(summaryHeader, true);
  styleRow(ws1.addRow(["Total Carbon Footprint", parseFloat(totalEmissions.toFixed(2)), "MT CO₂e"]));
  styleRow(ws1.addRow(["Scope 1 (Direct) Emissions", parseFloat(scope1.toFixed(2)), "MT CO₂e"]));
  styleRow(ws1.addRow(["Scope 2 (Indirect) Emissions", parseFloat(scope2.toFixed(2)), "MT CO₂e"]));
  styleRow(ws1.addRow(["Carbon Intensity", parseFloat(parseFloat(intensity).toFixed(4)), "kg CO₂/L"]));
  styleRow(ws1.addRow(["Total Energy Consumed", parseFloat(reportData.energy.toFixed(1)), "MJ"]));
  styleRow(ws1.addRow(["Renewable Mix Ratio", parseFloat(parseFloat(renewRatio).toFixed(1)), "%"]));
  styleRow(ws1.addRow(["Beverage Production Output", parseFloat(reportData.prod.toFixed(1)), "Liters"]));

  for (let r = 3; r <= 6; r++) {
    ws1.getRow(r).getCell(1).font = boldFont;
  }

  // 2. Emission Data
  const ws2 = workbook.addWorksheet("Emission Data");
  ws2.columns = [
    { header: "Emission Source", key: "source", width: 28 },
    { header: "Scope", key: "scope", width: 12 },
    { header: "Raw Consumption", key: "raw", width: 20 },
    { header: "Unit", key: "unit", width: 12 },
    { header: "Emission Factor", key: "factor", width: 20 },
    { header: "Calculated CO₂e", key: "co2", width: 18 }
  ];
  styleRow(ws2.getRow(1), true);
  styleRow(ws2.addRow(["HSD (Diesel)", "Scope 1", parseFloat(reportData.fuel.hsd.toFixed(1)), "L", "2.68 kg/L", parseFloat(s1_hsd.toFixed(3))]));
  styleRow(ws2.addRow(["Furnace Oil", "Scope 1", parseFloat(reportData.fuel.fur.toFixed(1)), "L", "2.68 kg/L", parseFloat(s1_fur.toFixed(3))]));
  styleRow(ws2.addRow(["LPG", "Scope 1", parseFloat(reportData.fuel.lpg.toFixed(1)), "kg", "2.98 kg/kg", parseFloat(s1_lpg.toFixed(3))]));
  styleRow(ws2.addRow(["PNG", "Scope 1", parseFloat(reportData.fuel.png.toFixed(1)), "SCM", "2.02 kg/SCM", parseFloat(s1_png.toFixed(3))]));
  styleRow(ws2.addRow(["Biomass", "Scope 1", parseFloat(reportData.fuel.bio.toFixed(1)), "MJ", "0.05 kg/MJ", parseFloat(s1_bio.toFixed(3))]));
  styleRow(ws2.addRow(["Grid Electricity", "Scope 2", parseFloat(reportData.power.grid.toFixed(1)), "kWh", "0.82 kg/kWh", parseFloat(scope2.toFixed(3))]));
  const totalRow = ws2.addRow(["Total Carbon Footprint", "", "", "", "", parseFloat(totalEmissions.toFixed(2))]);
  styleRow(totalRow);
  totalRow.getCell(1).font = boldFont;
  totalRow.getCell(6).font = boldFont;
  ws2.mergeCells(`A${totalRow.number}:E${totalRow.number}`);

  // 3. Energy Consumption
  const ws3 = workbook.addWorksheet("Energy Consumption");
  ws3.columns = [
    { header: "Energy Category", key: "cat", width: 28 },
    { header: "Consumption Value", key: "val", width: 22 },
    { header: "Unit", key: "unit", width: 15 }
  ];
  styleRow(ws3.getRow(1), true);
  styleRow(ws3.addRow(["Grid Power", parseFloat(reportData.power.grid.toFixed(1)), "kWh"]));
  styleRow(ws3.addRow(["Renewable Power", parseFloat(reportData.power.renew.toFixed(1)), "kWh"]));
  styleRow(ws3.addRow(["Solar Power", parseFloat(reportData.power.solar.toFixed(1)), "kWh"]));
  styleRow(ws3.addRow(["Total Electricity", parseFloat(totalPower.toFixed(1)), "kWh"]));
  styleRow(ws3.addRow(["Total Calculated Energy", parseFloat(reportData.energy.toFixed(1)), "MJ"]));
  styleRow(ws3.addRow(["Energy Intensity Ratio", parseFloat((reportData.prod > 0 ? (reportData.energy / reportData.prod) : 0).toFixed(2)), "MJ/L"]));

  // 4. Fuel Consumption
  const wsFuel = workbook.addWorksheet("Fuel Consumption");
  wsFuel.columns = [
    { header: "Fuel Type", key: "fuel", width: 25 },
    { header: "Consumption Volume", key: "val", width: 22 },
    { header: "Unit", key: "unit", width: 15 }
  ];
  styleRow(wsFuel.getRow(1), true);
  styleRow(wsFuel.addRow(["HSD (Diesel)", parseFloat(reportData.fuel.hsd.toFixed(1)), "Liters"]));
  styleRow(wsFuel.addRow(["Furnace Oil", parseFloat(reportData.fuel.fur.toFixed(1)), "Liters"]));
  styleRow(wsFuel.addRow(["LPG", parseFloat(reportData.fuel.lpg.toFixed(1)), "kg"]));
  styleRow(wsFuel.addRow(["PNG", parseFloat(reportData.fuel.png.toFixed(1)), "SCM"]));
  styleRow(wsFuel.addRow(["Biomass", parseFloat(reportData.fuel.bio.toFixed(1)), "MJ"]));

  // 5. Water Consumption
  const wsWater = workbook.addWorksheet("Water Consumption");
  wsWater.columns = [
    { header: "Water Metric", key: "metric", width: 35 },
    { header: "Status / Value", key: "val", width: 30 }
  ];
  styleRow(wsWater.getRow(1), true);
  styleRow(wsWater.addRow(["Municipal Supply Usage", "Scheduled for Phase 2 Integration"]));
  styleRow(wsWater.addRow(["Groundwater Withdrawal", "Scheduled for Phase 2 Integration"]));
  styleRow(wsWater.addRow(["Recycled Water Utilized", "Scheduled for Phase 2 Integration"]));

  // 6. Waste Management
  const wsWaste = workbook.addWorksheet("Waste Management");
  wsWaste.columns = [
    { header: "Waste Stream", key: "stream", width: 35 },
    { header: "Recycling / Output Status", key: "status", width: 30 }
  ];
  styleRow(wsWaste.getRow(1), true);
  styleRow(wsWaste.addRow(["Solid Waste Generated", "Scope 3 tracking scheduled for next iteration"]));
  styleRow(wsWaste.addRow(["Organic Waste Processed", "Scope 3 tracking scheduled for next iteration"]));
  styleRow(wsWaste.addRow(["Hazardous Disposal Index", "Scope 3 tracking scheduled for next iteration"]));

  // 7. Carbon Credits
  const ws4 = workbook.addWorksheet("Carbon Credits");
  ws4.columns = [
    { header: "Offset Mechanism", key: "mech", width: 30 },
    { header: "Current Metric", key: "metric", width: 22 },
    { header: "Status vs Target", key: "status", width: 20 },
    { header: "Carbon Credits Earned", key: "credits", width: 22 }
  ];
  styleRow(ws4.getRow(1), true);
  const greenPower = reportData.power.solar + reportData.power.renew;
  const greenCredit = Math.round(greenPower * 0.05);
  const bioCredit = Math.round(reportData.fuel.bio * 0.01);
  const totalCredits = greenCredit + bioCredit;
  styleRow(ws4.addRow(["Renewable & Solar Power Mix", `${renewRatio}%`, parseFloat(renewRatio) >= 25 ? "Exceeds Target (25%)" : "Under Target (25%)", greenCredit]));
  styleRow(ws4.addRow(["Biomass Co-firing Offset", `${reportData.fuel.bio.toLocaleString()} MJ`, reportData.fuel.bio > 0 ? "Active Offset" : "No Offset", bioCredit]));
  const creditsTotal = ws4.addRow(["Total Carbon Credits Earned", "", "", totalCredits]);
  styleRow(creditsTotal);
  creditsTotal.getCell(1).font = boldFont;
  creditsTotal.getCell(4).font = boldFont;
  ws4.mergeCells(`A${creditsTotal.number}:C${creditsTotal.number}`);

  // 8. KPIs
  const ws5 = workbook.addWorksheet("KPIs");
  ws5.columns = [
    { header: "Key Performance Indicator", key: "kpi", width: 35 },
    { header: "Value", key: "val", width: 20 },
    { header: "Target Benchmark", key: "target", width: 22 }
  ];
  styleRow(ws5.getRow(1), true);
  styleRow(ws5.addRow(["Renewable Energy Ratio", `${renewRatio}%`, ">= 30.0%"]));
  styleRow(ws5.addRow(["Green Fuel Mix Ratio", `${reportData.fuel.bio > 0 ? ((reportData.fuel.bio) / (reportData.energy || 1) * 100).toFixed(1) : 0}%`, ">= 10.0%"]));
  styleRow(ws5.addRow(["Carbon Intensity Index", `${intensity} kg/L`, "<= 0.0050 kg/L"]));
  styleRow(ws5.addRow(["Energy Usage Intensity", `${reportData.prod > 0 ? (reportData.energy / reportData.prod).toFixed(2) : 0} MJ/L`, "<= 1.50 MJ/L"]));

  // 9. Recommendations
  const ws6 = workbook.addWorksheet("Recommendations");
  ws6.columns = [
    { header: "Observation Area", key: "area", width: 25 },
    { header: "AI Energy/Carbon Recommendation", key: "rec", width: 55 },
    { header: "Est. Carbon Impact", key: "impact", width: 20 }
  ];
  styleRow(ws6.getRow(1), true);
  if (parseFloat(renewRatio) < 30) {
    styleRow(ws6.addRow(["Renewable Mix", "Expand rooftop solar arrays or purchase certified green power to meet the 30% ESG target.", "-15% Scope 2"]));
  } else {
    styleRow(ws6.addRow(["Renewable Mix", "Target achieved. Maintain solar panels cleaning cycles to ensure optimal generator output.", "Nominal"]));
  }
  if (reportData.fuel.fur > 0 || reportData.fuel.hsd > 0) {
    styleRow(ws6.addRow(["Fossil Fuels", "Reduce Scope 1 emissions by transitioning furnace boilers to LPG/PNG clean fuels or increasing biomass co-firing.", "-20% Scope 1"]));
  }
  styleRow(ws6.addRow(["Energy Efficiency", "Optimize plant chiller loops and configure automatic scheduling for packaging equipment to reduce idle power.", "-5% Electricity"]));

  workbook.worksheets.forEach((sheet) => {
    sheet.views = [{ state: "normal", showGridLines: true }];
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `SmartCarbonTrack_Report_${selectedPlant.replace(/\s+/g, "_")}_${year}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
