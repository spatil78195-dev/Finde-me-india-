const express = require('express');
const router = express.Router();
const MissingPerson = require('../models/MissingPerson');
const Sighting = require('../models/Sighting');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

const adminGuard = [verifyToken, requireRole('admin')];

// GET /api/admin/persons - all persons
router.get('/persons', ...adminGuard, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const persons = await MissingPerson.find(query)
      .populate('addedBy', 'name email role')
      .populate('assignedCompany', 'name companyName')
      .sort({ createdAt: -1 });
    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/companies - list all companies
router.get('/companies', ...adminGuard, async (req, res) => {
  try {
    const companies = await User.find({ role: 'company' }).select('name companyName email');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/persons/:id/status - approve/reject/found
router.patch('/persons/:id/status', ...adminGuard, async (req, res) => {
  try {
    const { status } = req.body;
    const person = await MissingPerson.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!person) return res.status(404).json({ message: 'Not found' });
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/persons/:id/assign - assign to company
router.patch('/persons/:id/assign', ...adminGuard, async (req, res) => {
  try {
    const { companyId } = req.body;
    const person = await MissingPerson.findByIdAndUpdate(
      req.params.id,
      { assignedCompany: companyId || null },
      { new: true }
    ).populate('assignedCompany', 'name companyName');
    if (!person) return res.status(404).json({ message: 'Not found' });
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/persons/:id
router.delete('/persons/:id', ...adminGuard, async (req, res) => {
  try {
    await MissingPerson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/sightings - all sighting reports
router.get('/sightings', ...adminGuard, async (req, res) => {
  try {
    const sightings = await Sighting.find()
      .populate('personId', 'name')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(sightings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users - all users
router.get('/users', ...adminGuard, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
