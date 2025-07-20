const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  startSession,
  endSession,
  getCurrentSession,
  getSessionHistory
} = require("../controllers/sessionController");

router.post("/start", protect, startSession);
router.post("/end", protect, endSession);
router.get("/current", protect, getCurrentSession);
router.get("/history", protect, getSessionHistory);

module.exports = router;
