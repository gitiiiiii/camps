const mongoose = require('mongoose');

const RouteRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
  },
  // ✅ NEW: The new route the user wants
  requestedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  // ✅ NEW: The stop they selected
  requestedStopName: {
    type: String,
    required: true
  },
  // ✅ UPDATED: The reason is now optional
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  }
}, { timestamps: true });

module.exports = mongoose.model('RouteRequest', RouteRequestSchema);
