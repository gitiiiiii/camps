const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    default: 40,
  },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);