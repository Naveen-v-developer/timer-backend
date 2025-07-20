const Session = require("../models/Session");

exports.startSession = async (req, res) => {
  try {
    const existing = await Session.findOne({ user: req.user._id, endTime: null });
    if (existing) return res.status(400).json({ message: "Session already active" });

    const session = await Session.create({ user: req.user._id });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Failed to start session", error: err.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const session = await Session.findOne({ user: req.user._id, endTime: null });
    if (!session) return res.status(400).json({ message: "No active session to end" });

    session.endTime = new Date();
    session.durationMinutes = Math.round((session.endTime - session.startTime) / 60000);
    await session.save();

    res.json({ message: "Session ended", duration: session.durationMinutes, session });
  } catch (err) {
    res.status(500).json({ message: "Failed to end session", error: err.message });
  }
};

exports.getCurrentSession = async (req, res) => {
  try {
    const session = await Session.findOne({ user: req.user._id, endTime: null });
    if (!session) return res.json({ active: false });
    res.json({ active: true, session });
  } catch (err) {
    res.status(500).json({ message: "Error fetching current session", error: err.message });
  }
};

exports.getSessionHistory = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id, endTime: { $ne: null } }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err.message });
  }
};
