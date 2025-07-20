const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    sessionLength: Number,
    rating: Number,
    recommendedBreak: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
