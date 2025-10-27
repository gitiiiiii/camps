const express = require('express');
const router = express.Router();
const Tracking = require('../models/Tracking');
const RouteModel = require('../models/Route');
const User = require('../models/User');

// view tracking page public (simple)
router.get('/', async (req,res)=>{
  const routes = await RouteModel.find();
  res.render('tracking',{ routes });
});

// driver location update form (driver must be logged in)
router.get('/update', async (req,res)=>{
  if (!req.session.user || req.session.user.role !== 'driver') return res.redirect('/login');
  // get routes assigned to this driver
  const routes = await RouteModel.find({ driver: req.session.user.id });
  res.render('tracking_update',{ routes });
});

router.post('/update', async (req,res)=>{
  if (!req.session.user || req.session.user.role !== 'driver') return res.redirect('/login');
  const { route, lat, lng, note } = req.body;
  const t = new Tracking({ route, driver: req.session.user.id, lat: parseFloat(lat), lng: parseFloat(lng), note });
  await t.save();
  res.redirect('/tracking/update?success=1');
});

// get latest tracking per route (AJAX)
router.get('/latest/:routeId', async (req,res)=>{
  const data = await Tracking.find({ route: req.params.routeId }).sort({ timestamp:-1 }).limit(20);
  res.json(data);
});

module.exports = router;
