const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const requestLogger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

// Middlewares bawaan & pihak ketiga
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve file statis dari folder public
app.use(express.static(path.join(__dirname, '../public')));

// Mount main API routes
app.use('/api', routes);

// Fallback catch-all: non-API routes serve index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 Handler khusus API yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rute '${req.originalUrl}' dengan method ${req.method} tidak ditemukan.`,
  });
});

// Centralized error handling
app.use(errorHandler);
  
const path = require('path');  
app.use(express.static(path.join(__dirname, '../public')));  
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html'))); 


module.exports = app;
