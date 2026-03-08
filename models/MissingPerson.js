const mongoose = require('mongoose');

const missingPersonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  lastSeenLocation: { type: String, required: true },
  date: { type: Date, required: true },
  contact: { type: String, required: true },
  description: { type: String },
  photo: { type: String }, // filename in uploads/
  qrCode: { type: String }, // base64 data URL
  status: {
    type: String,
    enum: ['pending', 'verified', 'printed', 'found'],
    default: 'pending'
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  helplineNumber: { type: String, default: '1800-180-1234' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MissingPerson', missingPersonSchema);
