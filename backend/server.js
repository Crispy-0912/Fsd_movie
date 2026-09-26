const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Dynamic allowed origins for development, Vercel, and GitHub Pages
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://fsd-movie.vercel.app',
  'https://crispy-0912.github.io'
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach(url => {
    const clean = url.trim().replace(/\/$/, '');
    if (clean && !allowedOrigins.includes(clean)) {
      allowedOrigins.push(clean);
    }
  });
}

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow mobile apps, postman, curl
  const cleanOrigin = origin.replace(/\/$/, '');
  return (
    allowedOrigins.includes(cleanOrigin) ||
    cleanOrigin.endsWith('.vercel.app') ||
    cleanOrigin.endsWith('.github.io') ||
    cleanOrigin.includes('localhost') ||
    cleanOrigin.includes('127.0.0.1')
  );
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', limiter);

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');

// Root & Health Check Routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MovieMate Backend API is running.',
    health: '/api/health',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    message: 'MovieMate API is up and running!',
    database: isDbConnected ? 'connected' : 'connecting_or_disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/watchlist', watchlistRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🎬 MovieMate Backend Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
