const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');

// Show the homepage
router.get('/', (req, res) => {
  res.render('index', { page: 'home' });
});

// Show all available routes
router.get('/routes', async (req, res) => {
  try {
    const routes = await Route.find();
    res.render('routes', { page: 'routes', routes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Show all available schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('route')
      .populate('driver', 'name') // Only get the driver's name
      .populate('vehicle');
    res.render('schedules', { page: 'schedules', schedules });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;