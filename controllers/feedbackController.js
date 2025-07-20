const Feedback = require("../models/Feedback");
const Session = require("../models/Session"); // Make sure path is correct

// POST /api/feedback/submit
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment, sessionLength } = req.body; // ⬅️ Include sessionLength
    const user = req.user._id;

    const feedback = await Feedback.create({ user, rating, comment, sessionLength }); // ⬅️ Save it
    res.status(201).json({ msg: "Feedback submitted", feedback });
  } catch (error) {
    res.status(500).json({ msg: "Failed to submit feedback", error: error.message });
  }
};

// GET /api/feedback/user/:id
exports.getUserFeedback = async (req, res) => {
  try {
    const userId = req.params.id;

    const feedbacks = await Feedback.find({ user: userId })
      .sort({ submittedAt: -1 });

    res.status(200).json({ msg: "Feedback retrieved", feedbacks });
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch feedback", error: error.message });
  }
};
