const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  route: { type: mongoose.Schema.Types.ObjectId, ref:'Route' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  lat: Number,
  lng: Number,
  note: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tracking', trackingSchema);
