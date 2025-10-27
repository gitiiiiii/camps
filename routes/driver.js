const express = require('express');
const router = express.Router();
const BusLocation = require('../models/BusLocation');

// Middleware — only driver can update
function isDriver(req, res, next) {
  if (req.session.user && req.session.user.role === 'driver') {
    return next();
  }
  return res.status(403).send('Access denied');
}

// Update driver location
router.post('/update-location', isDriver, async (req, res) => {
  const { latitude, longitude } = req.body;
  const driverId = req.session.user._id;

  try {
    await BusLocation.findOneAndUpdate(
      { driverId },
      { latitude, longitude, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    req.io.emit('busLocationUpdated', { driverId, latitude, longitude });
    res.json({ success: true, message: '✅ Location updated successfully' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
