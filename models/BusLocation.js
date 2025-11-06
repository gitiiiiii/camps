const mongoose = require('mongoose');

const BusLocationSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // Stored as [Longitude, Latitude]
      required: true,
    },
  },
}, { timestamps: true }); // 'createdAt' timestamp is crucial here

// This index is very important for fast map-based queries
BusLocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BusLocation', BusLocationSchema);