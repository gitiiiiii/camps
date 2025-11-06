const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Core Fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'driver'], default: 'user' },

  // Profile Fields
  profilePic: { type: String, default: '/images/default-profile.png' },
  studentId: { type: String },
  course: { type: String },
  college: { type: String },
  year: { type: String },
  sem: { type: String },
  phone: { type: String },
  
  // Route Fields
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  
  // ✅ NEW: This is the user's assigned bus stop
  homeStopName: {
    type: String
  }
  
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);