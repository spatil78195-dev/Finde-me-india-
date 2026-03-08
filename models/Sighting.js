const mongoose = require('mongoose');

const sightingSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'MissingPerson', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterName: { type: String },
  reporterPhone: { type: String },
  location: { type: String, required: true },
  message: { type: String },
  photo: { type: String }, // filename in uploads/
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sighting', sightingSchema);
