const Session = require("../models/Session");
const redisClient = require("../utils/redisClient");

// POST /api/session/start
const startSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingSession = await Session.findOne({
      userId,
      endTime: null
    });

    if (existingSession) {
      return res.status(400).json({ message: "A session is already active." });
    }

    const session = new Session({
      userId,
      startTime: new Date()
    });

    await session.save();

    res.status(201).json(session);
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({ message: "Failed to start session" });
  }
};

// POST /api/session/end
const endSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await Session.findOne({
      userId,
      endTime: null
    });

    if (!session) {
      return res.status(404).json({ message: "No active session found." });
    }

    session.endTime = new Date();
    await session.save();

    // ❗ Invalidate Redis cache for session history
    await redisClient.del(`session_history_${userId}`);

    res.status(200).json({ message: "Session ended", session });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ message: "Failed to end session" });
  }
};

// GET /api/session/current
const getCurrentSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await Session.findOne({
      userId,
      endTime: null
    }).lean();

    if (!session) {
      return res.status(404).json({ message: "No active session" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error getting current session:", error);
    res.status(500).json({ message: "Failed to get current session" });
  }
};

// GET /api/session/history
const getSessionHistory = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `session_history_${userId}`;

  try {
    // ✅ 1. Check Redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("📦 Session history from Redis cache");
      return res.status(200).json(JSON.parse(cached));
    }

    // ✅ 2. If not cached, fetch from DB
    const history = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ 3. Store in Redis (for 60 seconds)
    await redisClient.set(cacheKey, JSON.stringify(history), {
      EX: 60 // seconds
    });

    console.log("💾 Session history cached to Redis");
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching session history:", error);
    res.status(500).json({ message: "Failed to get session history" });
  }
};

module.exports = {
  startSession,
  endSession,
  getCurrentSession,
  getSessionHistory
};
