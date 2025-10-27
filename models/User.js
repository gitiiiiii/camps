const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required:true },
  email: { type: String, required:true, unique:true },
  password: { type: String, required:true },
  role: { type: String, enum:['student','faculty','driver','admin'], required:true },
  phone: String,
  vehicleInfo: String
}, { timestamps:true });

module.exports = mongoose.model('User', userSchema);
