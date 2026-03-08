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

// DB connection guard — returns 503 instantly instead of 10s buffering timeout
const requireDB = require('./middleware/dbCheck');

// Routes (all guarded by DB check)
app.use('/api/auth', requireDB, require('./routes/auth'));
app.use('/api/persons', requireDB, require('./routes/persons'));
app.use('/api/admin', requireDB, require('./routes/admin'));
app.use('/api/company', requireDB, require('./routes/company'));
app.use('/api/sightings', requireDB, require('./routes/sightings'));

// Health check (no DB guard — always responds)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Catch-all: serve HTML pages
app.get('*', (req, res) => {
  const page = req.path.endsWith('.html') ? req.path.slice(1) : 'index.html';
  const filePath = path.join(__dirname, 'public', page);
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately (serves static pages even without DB)
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Static pages available immediately\n`);
});

// Disable mongoose buffering so errors appear instantly instead of timing out
mongoose.set('bufferCommands', false);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected – all API features active'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('📌 Fix: Set MONGODB_URI in .env to your MongoDB Atlas connection string.');
    console.error('   Free Atlas cluster: https://www.mongodb.com/atlas/database\n');
  });
