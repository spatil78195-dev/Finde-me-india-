const express = require('express');
const router = express.Router();
const Sighting = require('../models/Sighting');

// POST /api/sightings/:personId  (JSON body, no multer needed)
router.post('/:personId', async (req, res) => {
  try {
    const { location, message, reporterName, reporterPhone, photo } = req.body;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const sighting = await Sighting.create({
      personId: req.params.personId,
      location,
      message: message || '',
      reporterName: reporterName || '',
      reporterPhone: reporterPhone || '',
      photo: photo || null,
      reportedBy: null
    });

    res.status(201).json(sighting);
  } catch (err) {
    console.error('Sighting error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to submit sighting' });
  }
});

// GET /api/sightings/person/:personId
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
