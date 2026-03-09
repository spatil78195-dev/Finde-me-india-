const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const MissingPerson = require('../models/MissingPerson');
const { verifyToken } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/persons - add missing person
router.post('/', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { name, age, gender, lastSeenLocation, date, contact, description, helplineNumber } = req.body;
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

    const person = await MissingPerson.create({
      name, age, gender, lastSeenLocation, date, contact, description,
      photo,
      helplineNumber: helplineNumber || '1800-180-1234',
      addedBy: req.user.id
    });

    // Generate QR code pointing to detail page
    const detailUrl = `${req.protocol}://${req.get('host')}/detail.html?id=${person._id}`;
    const qrCode = await QRCode.toDataURL(detailUrl);
    person.qrCode = qrCode;
    await person.save();

    res.status(201).json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/persons - list verified/found persons (public)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status === 'all') {
      // Do not filter by status
    } else if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['verified', 'printed', 'found'] };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { lastSeenLocation: { $regex: search, $options: 'i' } }
      ];
    }
    const persons = await MissingPerson.find(query)
      .populate('addedBy', 'name')
      .populate('assignedCompany', 'name companyName')
      .sort({ createdAt: -1 });
    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/persons/stats - stats for home page
router.get('/stats', async (req, res) => {
  try {
    const total = await MissingPerson.countDocuments();
    const verified = await MissingPerson.countDocuments({ status: { $in: ['verified', 'printed'] } });
    const found = await MissingPerson.countDocuments({ status: 'found' });
    const printed = await MissingPerson.countDocuments({ status: 'printed' });
    res.json({ total, verified, found, printed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/persons/my - user's own submissions
router.get('/my', verifyToken, async (req, res) => {
  try {
    const persons = await MissingPerson.find({}).sort({ createdAt: -1 });
    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/persons/:id - single person
router.get('/:id', async (req, res) => {
  try {
    const person = await MissingPerson.findById(req.params.id)
      .populate('addedBy', 'name email')
      .populate('assignedCompany', 'name companyName');
    if (!person) return res.status(404).json({ message: 'Person not found' });
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
