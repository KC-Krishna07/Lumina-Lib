const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// --- Global Middleware ---
// 1. CORS: Configured to allow your React frontend (port 5173) to communicate with this API.
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body Parser: Essential for reading JSON data sent from your "Sign In" modal.
app.use(express.json()); 

// --- API Routes ---
// This mounts your authentication logic (signup/login) under the /api/auth prefix.
app.use('/api/auth', authRoutes);

// --- Database Connection ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connection logic with error handling to ensure your server doesn't crash on DB failure.
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ Database Connection Error:", err.message);
    process.exit(1); // Stop the server if DB connection fails
  });

// --- Base Route ---
// Useful for health checks to ensure the backend is live.
app.get('/', (req, res) => {
  res.status(200).json({ status: "active", message: "Bookflix Server is Running..." });
});

// --- 404 & Global Error Handling ---
// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error middleware to catch unhandled exceptions and prevent server crashes.
app.use((err, req, res, next) => {
    console.error("Critical Server Error:", err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is floating on http://localhost:${PORT}`);
});