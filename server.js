const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors"); // ⬅️ moved up
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const predictRoutes = require("./routes/predictRoutes");
const cycleRoutes = require("./routes/cycleRoutes");
const statsRoutes = require("./routes/statsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const taskRoutes = require("./routes/taskRoutes");

dotenv.config();
const app = express();

// ✅ CORS Middleware BEFORE all routes
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Body parser
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/cycle", cycleRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("MongoDB connection failed:", err));
