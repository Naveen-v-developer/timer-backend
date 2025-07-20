// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");

router.get("/daily", statsController.getDailyStats);
router.get("/weekly", statsController.getWeeklyStats);
router.get("/chart-data", statsController.getChartData);

module.exports = router;
