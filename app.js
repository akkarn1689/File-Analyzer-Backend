const express = require("express");
const config = require("./config/config");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const cors = require("cors");
const router = require('./routes/uploadRoutes');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const http = require('http');

// Initialize the app
const app = express();

const server = http.createServer(app);

// Load environment variables early in the application
require("dotenv").config();

const corsOptions = {
  origin: ['https://file-analyzer-6pnj.onrender.com/', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware Setup
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// Database connection

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the File Analyzer');
});

app.use('/api', router);


// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

// Server setup with error handling
server.listen(config.port, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${config.port}`);
});


// Export for testing
module.exports = app;