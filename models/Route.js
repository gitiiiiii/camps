const mongoose = require('mongoose');

// This is the sub-document schema for each stop
const StopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  sequence: {
    type: Number,
    required: true,
  }
});

const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  // This now uses the new StopSchema
  stops: [StopSchema], 
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);
