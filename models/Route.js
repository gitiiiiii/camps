const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
  sequence: Number
});

const routeSchema = new mongoose.Schema({
  title: { type: String, required:true },
  code: String,
  stops: [stopSchema],
  driver: { type: mongoose.Schema.Types.ObjectId, ref:'User' }
}, { timestamps:true });

module.exports = mongoose.model('Route', routeSchema);
