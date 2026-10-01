require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const initSocket = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

// 1. Fully open up the CORS layer to automatically answer data fetches and OPTIONS preflights smoothly
app.use(cors());

// 2. Relax Helmet headers so it does not intercept secure cloud domain assets
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to IntellMeet API" });
});

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`IntellMeet server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
