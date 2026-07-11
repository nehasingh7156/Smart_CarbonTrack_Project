const express = require('express');
const router = express.Router();

const carbonController =
  require('../controllers/carbonController');

// Admin Authorization Middleware
const isAdmin = (req, res, next) => {
  const role = req.headers["x-user-role"] || req.headers["authorization"];
  if (role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin authorization required."
    });
  }
};

// Save plant entry
router.post('/entry', carbonController.submitData);

// Fetch dashboard data
router.get(
  '/dashboard/:plant/:month/:year',
  carbonController.getDashboard
);

// Fetch all historical plant data
router.get(
  '/plant-data/:userId',
  carbonController.getData
);

router.get('/plants', carbonController.getAllPlants);
router.get('/plants-list', carbonController.getPlantsList);
router.get('/all-entries', carbonController.getAllEntries);

// Admin Plant Management
router.post('/admin/plant', isAdmin, carbonController.addPlant);
router.delete('/admin/plant/:id', isAdmin, carbonController.deletePlant);

module.exports = router;

