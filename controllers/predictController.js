const axios = require("axios");
const Recommendation = require("../models/Recommendation");

exports.predictBreakDuration = async (req, res) => {
  const { sessionLength, rating } = req.body;

  try {
    // Call Flask ML server
    const response = await axios.post("https://timer-ml.onrender.com/api/predict/break-duration", {
      session_length: sessionLength,
      rating: rating,
    });

    const recommendedBreak = response.data.recommended_break;

    // Save to MongoDB
    const newRec = new Recommendation({
      sessionLength,
      rating,
      recommendedBreak,
    });

    await newRec.save();

    res.status(200).json({
      message: "Prediction stored successfully",
      prediction: recommendedBreak,
    });
  } catch (err) {
    console.error("Prediction Error:", err.message);
    res.status(500).json({ error: "Failed to get prediction" });
  }
};

exports.getRecommendation = async (req, res) => {
  try {
    const latest = await Recommendation.find({}).sort({ _id: -1 }).limit(1);
if (latest.length === 0) {
  return res.status(404).json({ message: "No recommendation found yet" });
}
res.status(200).json(latest[0]);


    res.status(200).json({
      recommendation: latest.recommendedBreak,
      sessionLength: latest.sessionLength,
      rating: latest.rating,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve recommendation" });
  }
};
