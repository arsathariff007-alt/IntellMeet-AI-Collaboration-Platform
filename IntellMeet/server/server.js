require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const http = require("http"); // Native Node module to build an HTTP server wrapper
const cors = require("cors");
const helmet = require("helmet");

// Import Routers
const authRoutes = require("./routes/authRoutes");
const meetingRoutes = require("./routes/meetingRoutes");

// Import Real-time Socket Server configuration utility
const initSocket = require("./socket/socketHandler");

const app = express();

// Create an HTTP server instance using the Express application instance
const server = http.createServer(app);

app.use(cors());
app.use(helmet({
   crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(express.json());

// Mount API Routers
app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

// Home Root Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to IntellMeet API",
  });
});

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    
    // Initialize the WebSocket engine on top of our running HTTP server
    initSocket(server);

    // CRUCIAL: Listen using the 'server' instance wrapper, NOT 'app.listen'
    server.listen(PORT, () => {
      console.log(`IntellMeet server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
