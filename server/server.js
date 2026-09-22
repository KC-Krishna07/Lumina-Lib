const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// --- 1. CORS Configuration (Dynamic for Local + Vercel) ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL // Set this in Vercel settings (e.g., https://lumina-lib.vercel.app)
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Or set to callback(null, true) during testing
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// --- 2. Body Parser ---
app.use(express.json());

// --- 3. Database Connection (Cached for Serverless) ---
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
  }
};

// Middleware to ensure DB is connected before processing any request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// --- 4. API Routes ---
app.use('/api/auth', authRoutes);

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({ status: "active", message: "Lumina-Lib Server is Running..." });
});

// --- 5. Error Handlers ---
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Critical Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// --- 6. Conditional Local Server Start ---
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;