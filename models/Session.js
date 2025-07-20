const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  durationMinutes: Number,
  rating: Number,              // Optional feedback
  breakDuration: Number,       // ML predicted break time
  date: { type: Date, default: Date.now },
}, { timestamps: true });      // This adds createdAt and updatedAt automatically

module.exports = mongoose.model("Session", sessionSchema);
