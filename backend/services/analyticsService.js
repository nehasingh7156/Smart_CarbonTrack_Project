const PlantEntry = require("../models/plantentry");

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/*
========================================
TREND SERVICE
========================================
*/
exports.getTrendData = async (plant) => {

  const result = await PlantEntry.aggregate([
    { $match: { plant: { $regex: new RegExp("^\\s*" + escapeRegex(plant.trim()) + "\\s*$", "i") } } },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        totalCarbon: { $sum: "$kpis.totalCarbonMT" }
      }
    },
    { $sort: { "_id.year": -1 } }
  ]);

  if (!result.length) return [];

  const latestYear = result[0]._id.year;

  const trend = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;

    const found = result.find(
      r => r._id.month === month && r._id.year === latestYear
    );

    return {
      month,
      year: latestYear,
      totalCarbon: found ? found.totalCarbon : 0
    };
  });

  return trend;
};

/*
========================================
COMPARISON SERVICE
========================================
*/
exports.getComparisonData = async (plant, type) => {

  const entries = await PlantEntry.find({ plant: { $regex: new RegExp("^\\s*" + escapeRegex(plant.trim()) + "\\s*$", "i") } })
    .sort({ year: 1, month: 1 });

  if (entries.length < 2) return null;

  const latest = entries.at(-1);

  let previous;

  if (type === "yoy") {
    previous = entries.find(
      e =>
        e.year === latest.year - 1 &&
        e.month === latest.month
    );
  }

  else if (type === "qoq") {
    previous = entries.at(-4);
  }

  else {
    previous = entries.at(-2);
  }

  if (!previous) return null;

  const change =
    ((latest.kpis.totalCarbonMT - previous.kpis.totalCarbonMT) /
      (previous.kpis.totalCarbonMT || 1)) * 100;

  return {
    current: latest.kpis.totalCarbonMT,
    previous: previous.kpis.totalCarbonMT,
    percentChange: Number(change.toFixed(2)),
    type
  };
};

/*
========================================
HOTSPOT SERVICE
========================================
*/
exports.getHotspotData = async (plant, month, year) => {

  const entry = await PlantEntry.findOne({
    plant: { $regex: new RegExp("^\\s*" + escapeRegex(plant.trim()) + "\\s*$", "i") },
    month,
    year
  });
  if (!entry) return null;

  const i = entry.inputs;

  const sources = [
    { name: "Grid Power", value: Number(i.gridPower) || 0 },
    { name: "Renewable Power", value: Number(i.renewablePower) || 0 },
    { name: "Solar Power", value: Number(i.solarPower) || 0 },
    { name: "LPG", value: Number(i.lpg) || 0 },
    { name: "PNG", value: Number(i.png) || 0 },
    { name: "HSD", value: Number(i.hsd) || 0 },
    { name: "Furnace Oil", value: Number(i.furnaceOil) || 0 },
    { name: "Biomass", value: Number(i.biomass) || 0 }
  ];

  sources.sort((a, b) => b.value - a.value);

  const total = sources.reduce((s, x) => s + x.value, 0);

  const top3 = sources.slice(0, 3)
    .reduce((s, x) => s + x.value, 0);

  return {
    sources,
    top3Percent: total
      ? Number(((top3 / total) * 100).toFixed(2))
      : 0
  };
};

/*
========================================
SCENARIO SERVICE
========================================
*/
exports.runScenarioAnalysis = async (data) => {

  const {
    currentCarbon,
    renewableIncreasePercent = 0,
    biomassIncreasePercent = 0
  } = data;

  const reduction =
    (renewableIncreasePercent * 0.5 +
      biomassIncreasePercent * 0.3) / 100;

  const projected =
    currentCarbon - currentCarbon * reduction;

  return {
    projectedCarbon: Number(projected.toFixed(2)),
    savings: Number((currentCarbon - projected).toFixed(2)),
    reductionPercent: Number((reduction * 100).toFixed(2))
  };
};
