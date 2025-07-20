const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Timer", timerSchema);
