require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB connection guard
const requireDB = require('./middleware/dbCheck');

// Routes
app.use('/api/auth', requireDB, require('./routes/auth'));
app.use('/api/persons', requireDB, require('./routes/persons'));
app.use('/api/admin', requireDB, require('./routes/admin'));
app.use('/api/company', requireDB, require('./routes/company'));
app.use('/api/sightings', requireDB, require('./routes/sightings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Catch-all
app.get('*', (req, res) => {
  const page = req.path.endsWith('.html')
    ? req.path.slice(1)
    : 'index.html';

  const filePath = path.join(__dirname, 'public', page);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});


// ✅ MongoDB FIX for Vercel

mongoose.set('bufferCommands', false);

const mongoURI = process.env.MONGODB_URI;

if (!global._mongoose) {
  global._mongoose = mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 15000,
  })
    .then(() => {
      console.log("✅ MongoDB connected");
    })
    .catch((err) => {
      console.log("❌ MongoDB error:", err.message);
    });
}


// IMPORTANT for Vercel
module.exports = app;