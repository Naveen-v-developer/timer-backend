const Session = require("../models/Session");
const redis = require("../config/redis");

exports.startSession = async (req, res) => {
  try {
    const existing = await Session.findOne({ user: req.user._id, endTime: null });
    if (existing) return res.status(400).json({ message: "Session already active" });

    const session = await Session.create({ user: req.user._id });

    // Invalidate cache
    await redis.del(`session:current:${req.user._id}`);
    await redis.del(`session:history:${req.user._id}`);

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

    // Invalidate cache
    await redis.del(`session:current:${req.user._id}`);
    await redis.del(`session:history:${req.user._id}`);

    res.json({ message: "Session ended", duration: session.durationMinutes, session });
  } catch (err) {
    res.status(500).json({ message: "Failed to end session", error: err.message });
  }
};

exports.getCurrentSession = async (req, res) => {
  try {
    const cacheKey = `session:current:${req.user._id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const session = await Session.findOne({ user: req.user._id, endTime: null });
    const result = session ? { active: true, session } : { active: false };

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(result), "EX", 300);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching current session", error: err.message });
  }
};

exports.getSessionHistory = async (req, res) => {
  try {
    const cacheKey = `session:history:${req.user._id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const sessions = await Session.find({ user: req.user._id, endTime: { $ne: null } }).sort({ createdAt: -1 });

    // Cache for 10 minutes
    await redis.set(cacheKey, JSON.stringify(sessions), "EX", 600);

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err.message });
  }
};
