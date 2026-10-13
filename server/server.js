require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { seedDefaultResources } = require('./controllers/resourceController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'NEXORA Dynamic Resource & Integration Engine API',
    version: '1.0.0',
    documentation: '/api'
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

// Connect DB and launch server (only when run directly, not required by tests)
const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultResources();

    app.listen(PORT, () => {
      console.log(`[Server] NEXORA Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[Server] API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error(`[Server Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
} else {
  // Required as module (e.g. tests): connect DB only
  connectDB().then(() => seedDefaultResources()).catch((err) => {
    console.error('[Module Init] DB connect error:', err.message);
  });
}

module.exports = app;
