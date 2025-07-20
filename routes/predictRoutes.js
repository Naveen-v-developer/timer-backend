const express = require("express");
const router = express.Router();
const {
  predictBreakDuration,
  getRecommendation,
} = require("../controllers/predictController");

router.post("/break-duration", predictBreakDuration);
router.get("/recommendation", getRecommendation);

module.exports = router;
