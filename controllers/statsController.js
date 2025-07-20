// controllers/statsController.js
const Session = require("../models/Session");
const moment = require("moment");



exports.getDailyStats = async (req, res) => {
  try {
    const today = moment().startOf("day").toDate();
    const tomorrow = moment(today).add(1, "day").toDate();

    const sessions = await Session.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const totalDuration = sessions.reduce((sum, s) => sum + s.sessionLength, 0);
    const avgRating = sessions.length > 0
      ? (sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length).toFixed(2)
      : 0;

    res.json({ totalSessions: sessions.length, totalDuration, avgRating });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch daily stats" });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const last7Days = moment().subtract(6, "days").startOf("day").toDate();

    const sessions = await Session.find({ date: { $gte: last7Days } });

    const grouped = {};

    sessions.forEach((s) => {
      const day = moment(s.date).format("YYYY-MM-DD");
      if (!grouped[day]) {
        grouped[day] = { total: 0, sessions: 0, ratings: [] };
      }
      grouped[day].total += s.sessionLength;
      grouped[day].sessions += 1;
      grouped[day].ratings.push(s.rating);
    });

    const result = Object.entries(grouped).map(([date, data]) => ({
      date,
      totalDuration: data.total,
      avgRating: (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(2),
      sessionCount: data.sessions,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weekly stats" });
  }
};

exports.getChartData = async (req, res) => {
  try {
    const last7Days = moment().subtract(6, "days").startOf("day").toDate();

    const sessions = await Session.find({ date: { $gte: last7Days } });

    const chart = {};

    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");
      chart[date] = { total: 0 };
    }

    sessions.forEach((s) => {
      const date = moment(s.date).format("YYYY-MM-DD");
      if (chart[date]) {
        chart[date].total += s.sessionLength;
      }
    });

    const labels = Object.keys(chart).sort();
    const data = labels.map((date) => chart[date].total);

    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
};
