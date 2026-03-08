const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Sighting = require('../models/Sighting');
const { verifyToken } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'sight_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/sightings/:personId - report a sighting
router.post('/:personId', upload.single('photo'), async (req, res) => {
  try {
    const { location, message, reporterName, reporterPhone } = req.body;
    const photo = req.file ? req.file.filename : null;
    const sighting = await Sighting.create({
      personId: req.params.personId,
      location,
      message,
      reporterName,
      reporterPhone,
      photo,
      reportedBy: req.user ? req.user.id : null
    });
    res.status(201).json(sighting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sightings/person/:personId - sightings for a specific person
router.get('/person/:personId', async (req, res) => {
  try {
    const sightings = await Sighting.find({ personId: req.params.personId })
      .sort({ createdAt: -1 });
    res.json(sightings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
