const express = require('express');
const router = express.Router();
const MissingPerson = require('../models/MissingPerson');
const { verifyToken, requireRole } = require('../middleware/auth');

const companyGuard = [verifyToken, requireRole('company', 'admin')];

// GET /api/company/persons - verified cases assigned to this company
router.get('/persons', ...companyGuard, async (req, res) => {
  try {
    const query = { status: { $in: ['verified', 'printed'] } };
    const persons = await MissingPerson.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/company/persons/:id/printed - mark as printed
router.patch('/persons/:id/printed', ...companyGuard, async (req, res) => {
  try {
    const person = await MissingPerson.findByIdAndUpdate(
      req.params.id,
      { status: 'printed' },
      { new: true }
    );
    if (!person) return res.status(404).json({ message: 'Not found' });
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
