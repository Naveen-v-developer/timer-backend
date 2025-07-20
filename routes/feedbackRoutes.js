const express = require("express");
const router = express.Router();
const { submitFeedback, getUserFeedback } = require("../controllers/feedbackController");
const protect = require("../middlewares/authMiddleware");

router.post("/submit", protect, submitFeedback);
router.get("/user/:id", protect, getUserFeedback);

module.exports = router;
