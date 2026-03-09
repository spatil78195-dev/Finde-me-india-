require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ===== MongoDB FIX (Vercel working) =====

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}


// connect before routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});


// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/persons', require('./routes/persons'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/company', require('./routes/company'));
app.use('/api/sightings', require('./routes/sightings'));


app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});


module.exports = app;