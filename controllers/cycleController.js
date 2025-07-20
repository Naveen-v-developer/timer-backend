// controllers/cycleController.js
const Cycle = require("../models/Cycle");

// POST /api/cycle/next
exports.scheduleNextCycle = async (req, res) => {
  const { type, duration } = req.body;

  if (!type || !duration) {
    return res.status(400).json({ message: "Type and duration are required" });
  }

  try {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const newCycle = await Cycle.create({
      type,
      duration,
      startTime,
      endTime
    });

    res.status(201).json({ message: "Next cycle scheduled", cycle: newCycle });
  } catch (error) {
    res.status(500).json({ error: "Failed to schedule next cycle" });
  }
};

// GET /api/cycle/status
exports.getCycleStatus = async (req, res) => {
  try {
    const cycles = await Cycle.find().sort({ createdAt: -1 });

    const completed = cycles.filter(c => c.status === 'completed');
    const pending = cycles.filter(c => c.status === 'pending');

    res.status(200).json({
      total: cycles.length,
      completed: completed.length,
      pending: pending.length,
      recent: cycles.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cycle status" });
  }
};
