const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");

// 🔹 Optional: Redis client for caching
// Uncomment after installing and setting up Redis
// const redisClient = require("./utils/redisClient");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/timerRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const predictRoutes = require("./routes/predictRoutes");
const cycleRoutes = require("./routes/cycleRoutes");
const statsRoutes = require("./routes/statsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const taskRoutes = require("./routes/taskRoutes");

dotenv.config();
const app = express();

// ✅ Compression middleware
app.use(compression());

// ✅ CORS Middleware
app.use(cors({
  origin: "http://localhost:3000", // or frontend URL
  credentials: true,
}));

// ✅ JSON parser
app.use(express.json());

// ✅ API Logger (Response time)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
  });
  next();
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/cycle", cycleRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    // ✅ Start server normally
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );

    // ✅ Optional: Cluster mode (multi-core CPU usage)
    // Uncomment to enable
    /*
    const cluster = require("cluster");
    const os = require("os");

    if (cluster.isPrimary) {
      const numCPUs = os.cpus().length;
      console.log(`Forking ${numCPUs} workers...`);
      for (let i = 0; i < numCPUs; i++) cluster.fork();
    } else {
      app.listen(PORT, () =>
        console.log(`Worker ${process.pid} running on port ${PORT}`)
      );
    }
    */

  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));
