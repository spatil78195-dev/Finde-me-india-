const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Sighting = require('../models/Sighting');
const { verifyToken } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/sightings/:personId - report a sighting
router.post('/:personId', upload.single('photo'), async (req, res) => {
  try {
    const { location, message, reporterName, reporterPhone } = req.body;
    let photo = null;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const header = req.file.buffer.subarray(0, 16).toString('utf8');
      let mime = req.file.mimetype;
      if (header.includes('ftypavif')) mime = 'image/avif';
      else if (header.includes('ftypheic')) mime = 'image/heic';
      else if (req.file.buffer[0] === 0xFF && req.file.buffer[1] === 0xD8) mime = 'image/jpeg';
      else if (req.file.buffer[0] === 0x89 && req.file.buffer[1] === 0x50) mime = 'image/png';
      
      photo = `data:${mime};base64,${b64}`;
    }
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
