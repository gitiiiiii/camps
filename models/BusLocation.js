const mongoose = require('mongoose');

const busLocationSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  busNumber: String,
  latitude: Number,
  longitude: Number,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BusLocation', busLocationSchema);
