require('dotenv').config();
const mongoose = require('mongoose');
const MissingPerson = require('./models/MissingPerson');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const admin = await User.findOne({ role: 'admin' }) || await User.create({ name: 'Admin', email: 'admin@test.com', password: '123', role: 'admin' });

  // Add dummy case if none exists
  const count = await MissingPerson.countDocuments();
  if (count === 0) {
    const p = await MissingPerson.create({
      name: 'Ravi Kumar',
      age: '12',
      gender: 'Male',
      lastSeenLocation: 'Delhi Railway Station',
      date: new Date(),
      contact: '9999999999',
      description: 'Wearing blue shirt',
      status: 'verified',
      addedBy: admin._id
    });
    console.log('Created dummy verified case:', p.name);
  } else {
    // Actually, make sure there is at least one verified case
    const anyPending = await MissingPerson.findOne({ status: 'pending' });
    if (anyPending) {
        anyPending.status = 'verified';
        await anyPending.save();
        console.log('Changed a pending case into verified');
    }
    console.log(`Found ${count} cases. Verification ready.`);
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
