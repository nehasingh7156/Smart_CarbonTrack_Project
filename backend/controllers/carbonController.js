const calculationService = require("../services/calculationService");
const PlantEntry = require("../models/plantentry");

// Robust month parser (handles numbers, numeric strings, full names, abbreviations, and 2-digit strings)
const parseMonth = (monthVal) => {
  if (monthVal === undefined || monthVal === null || monthVal === '') return NaN;
  if (!isNaN(monthVal)) {
    return Number(monthVal);
  }
  
  const mStr = String(monthVal).trim().toLowerCase();
  const monthMap = {
    jan: 1, january: 1, "01": 1,
    feb: 2, february: 2, "02": 2,
    mar: 3, march: 3, "03": 3,
    apr: 4, april: 4, "04": 4,
    may: 5, "05": 5,
    jun: 6, june: 6, "06": 6,
    jul: 7, july: 7, "07": 7,
    aug: 8, august: 8, "08": 8,
    sep: 9, september: 9, "09": 9,
    oct: 10, october: 10, "10": 10,
    nov: 11, november: 11, "11": 11,
    dec: 12, december: 12, "12": 12
  };
  
  return monthMap[mStr] || NaN;
};

// Robust year parser
const parseYear = (yearVal) => {
  if (yearVal === undefined || yearVal === null || yearVal === '') return NaN;
  return Number(yearVal);
};

// Escape regex characters to prevent special characters in plant names from breaking queries
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

exports.submitData = async (req, res) => {
  try {

    const plantData = req.body;

    // -----------------------------
    // 1. Basic validation
    // -----------------------------

    if (!plantData.userId || !plantData.month || !plantData.year) {
      return res.status(400).json({
        error: "Plant ID , month and year required"
      });
    }

    // -----------------------------
    // 2. Calculate KPIs
    // -----------------------------

    const kpis =
      calculationService.calculateKPIs(plantData);

    // -----------------------------
    // 3. Combine input + KPIs
    // -----------------------------

    const dashboardData = {
      ...plantData,
      kpis,
      timestamp: new Date()
    };

    // -----------------------------
    // 4. Save or Update entry (Case-insensitive & trimmed)
    // -----------------------------

    const plantName = plantData.userId.trim();
    const monthVal = parseMonth(plantData.month);
    const yearVal = parseYear(plantData.year);

    let dbEntry = await PlantEntry.findOne({
      plant: { $regex: new RegExp("^" + escapeRegex(plantName) + "$", "i") },
      month: monthVal,
      year: yearVal
    });

    if (dbEntry) {
      dbEntry.inputs = plantData;
      dbEntry.kpis = kpis;
      dbEntry.timestamp = new Date();
      await dbEntry.save();
    } else {
      dbEntry = new PlantEntry({
        plant: plantName,
        month: monthVal,
        year: yearVal,
        inputs: plantData,
        kpis,
        timestamp: new Date()
      });
      await dbEntry.save();
    }

    // -----------------------------
    // 5. Return dashboard payload
    // -----------------------------

    res.json({
      message: "Plant data saved",
      dashboard: dbEntry
    });

  } catch (error) {

    console.error("Controller error:", error);

    res.status(500).json({
      error: "Internal Server Error"
    });

  }
};


// Fetch stored data
exports.getData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: "User ID required"
      });
    }

    const data = await PlantEntry.find({
      plant: { $regex: new RegExp("^" + escapeRegex(userId.trim()) + "$", "i") }
    });

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    let { plant, month, year } = req.params;

    // Convert month & year to Number (using robust parsing helpers)
    month = parseMonth(month);
    year = parseYear(year);

    const data = await PlantEntry.findOne({
      plant: { $regex: new RegExp("^" + escapeRegex(plant.trim()) + "$", "i") },
      month,
      year
    });

    if (!data) {
      return res.status(404).json({
        error: "No dashboard data found"
      });
    }

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};

exports.getAllPlants = async (req, res) => {
  try {
    const plants = await PlantEntry.distinct("plant");
    res.json(plants);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
};