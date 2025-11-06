const express = require('express');
const router = express.Router();
const { isDriver } = require('../middleware/auth');
const Schedule = require('../models/Schedule');
const BusLocation = require('../models/BusLocation');
const Route = require('../models/Route'); // ✅ We need the Route model
const User = require('../models/User'); // ✅ We need the User model

// --- Dashboard route (no changes) ---
router.get('/dashboard', isDriver, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ driver: req.session.user._id })
      .populate('route')
      .populate('vehicle');
      
    res.render('driver/dashboard', { 
      title: 'Driver Dashboard',
      page: 'dashboard', 
      schedule: schedule,
      currentUser: req.session.user, 
      user: req.session.user 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- Location Update route (UPDATED) ---
router.post('/update-location', isDriver, async (req, res) => {
  const { lat, lng, routeId } = req.body;
  if (!lat || !lng || !routeId) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const location = new BusLocation({
      driver: req.session.user._id,
      route: routeId,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      }
    });
    await location.save();

    // 1. Populate data for the public map icon
    const locationToSend = await BusLocation.findById(location._id)
      .populate('driver', 'name')
      .populate('route', 'name'); 

    // 2. Broadcast to EVERYONE (for the map icon)
    req.io.emit('locationUpdate', locationToSend);

    // --- ✅ NEW GEOFENCE LOGIC ---
    // 3. Check for nearby stops and send PERSONAL alerts
    await checkAndSendAlerts(req.io, locationToSend);

    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// --- ✅ NEW GEOFENCE HELPER FUNCTIONS ---

// This function checks the driver's location against all stops on their route
async function checkAndSendAlerts(io, busData) {
  try {
    const driverPos = {
      lat: busData.location.coordinates[1],
      lng: busData.location.coordinates[0]
    };
    
    // 1. Get the route object to find all its stops
    const route = await Route.findById(busData.route._id);
    if (!route || !route.stops) return;

    // 2. Find all users assigned to this route
    const usersOnThisRoute = await User.find({ route: busData.route._id });
    if (!usersOnThisRoute.length) return;
    
    // 3. Check each user's home stop
    for (const user of usersOnThisRoute) {
      if (!user.homeStopName) {
        continue; // Skip users who haven't set a home stop
      }

      // 4. Find the coordinates for that user's specific stop
      const userStop = route.stops.find(s => s.name === user.homeStopName);
      if (!userStop) {
        continue; // User's home stop name doesn't match any stop on this route
      }
      
      const stopPos = { lat: userStop.lat, lng: userStop.lng };

      // 5. Calculate distance (in Kilometers)
      const distance = getHaversineDistance(driverPos, stopPos);

      // 6. If driver is less than 1km away
      if (distance < 1) {
        
        // 7. Send an alert ONLY to this one user
        const userSocketRoom = user._id.toString();
        io.to(userSocketRoom).emit('stopApproaching', {
          stopName: userStop.name,
          driverName: busData.driver.name
        });
        
        console.log(`Alert sent to ${user.name} for stop ${userStop.name}`);
      }
    }
  } catch (err) {
    console.error('Error in checkAndSendAlerts:', err);
  }
}

// Haversine formula to calculate distance between two lat/lng points
function getHaversineDistance(pos1, pos2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
    (1 - Math.cos(dLng)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

module.exports = router;