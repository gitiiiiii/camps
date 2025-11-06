const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  // This is the correct schema for the admin panel
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  estimatedArrivalTime: {
    type: String,
    required: true,
  },
  // Use 'daysActive' (an array) to match the admin form
  daysActive: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);