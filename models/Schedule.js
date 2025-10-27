const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  route: { type: mongoose.Schema.Types.ObjectId, ref:'Route', required:true },
  day: String,
  departureTime: String,
  arrivalTime: String,
  active: { type: Boolean, default:true }
}, { timestamps:true });

module.exports = mongoose.model('Schedule', scheduleSchema);
