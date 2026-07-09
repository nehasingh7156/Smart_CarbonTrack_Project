const express = require('express');
const router = express.Router();

const carbonController =
  require('../controllers/carbonController');

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

module.exports = router;
