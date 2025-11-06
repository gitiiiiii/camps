const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const BusLocation = require('../models/BusLocation');
const mongoose = require('mongoose');

// This is the route that renders the page
router.get('/', async (req, res) => {
  try {
    // We must fetch ALL routes here so we can:
    // 1. Show them in the dropdown
    // 2. Embed them in the page for the JavaScript to draw the stops
    const allRoutes = await Route.find().lean(); // .lean() makes it faster
    
    res.render('tracking', { 
      title: 'Live Tracking',
      page: 'track', 
      routes: allRoutes, // Pass all routes to the EJS
      currentUser: req.session.user || null 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// This API is called by the JavaScript to get bus locations
router.get('/api/locations/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    let matchQuery = {};

    // If a specific route is selected, create a match query for it
    if (routeId !== 'all') {
      matchQuery = { route: new mongoose.Types.ObjectId(routeId) };
    }

    const latestLocations = await BusLocation.aggregate([
      { $match: matchQuery }, // 1. Filter by route (if not 'all')
      { $sort: { createdAt: -1 } }, // 2. Get newest locations first
      { $group: { // 3. Get only the *latest* location for each driver
          _id: '$driver', 
          doc: { $first: '$$ROOT' }
      }},
      { $replaceRoot: { newRoot: '$doc' } }, // 4. Clean up the document
      { $lookup: { // 5. Join with User model to get driver name
          from: 'users', 
          localField: 'driver',
          foreignField: '_id',
          as: 'driverInfo'
      }},
      { $lookup: { // 6. Join with Route model to get route name
          from: 'routes', 
          localField: 'route',
          foreignField: '_id',
          as: 'routeInfo'
      }},
      { $unwind: '$driverInfo' }, // 7. Unpack the driverInfo array
      { $unwind: { path: '$routeInfo', preserveNullAndEmptyArrays: true } }, // 8. Unpack routeInfo
      { $addFields: { // 9. Rename 'routeInfo' to 'route'
          route: '$routeInfo'
      }},
      { $project: { // 10. Remove private data
          'driverInfo.password': 0,
          'driverInfo.email': 0,
          'routeInfo': 0 
      }}
    ]);
    
    res.json(latestLocations);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;