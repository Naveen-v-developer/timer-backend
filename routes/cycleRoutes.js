// routes/cycleRoutes.js
const express = require("express");
const router = express.Router();
const { scheduleNextCycle, getCycleStatus } = require("../controllers/cycleController");

router.post("/next", scheduleNextCycle);
router.get("/status", getCycleStatus);

module.exports = router;
