const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const RouteModel = require('../models/Route');

// list
router.get('/', async (req,res)=>{
  // ✅ FIX: Now populating all fields needed by the EJS file
  const schedules = await Schedule.find()
    .populate('route')
    .populate('driver', 'name')
    .populate('vehicle');

  res.render('schedules',{ 
    title: 'Bus Schedules',
    page: 'schedules',
    schedules: schedules,
    currentUser: req.session.user || null 
  });
});

// --- We are now using the admin panel to create schedules ---
// --- The code below can be deleted, but is left here for reference ---

// admin create
router.get('/new', async (req,res)=>{
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  // This route is now handled by /admin/schedules
  res.redirect('/admin/schedules');
});

router.post('/', async (req,res)=>{
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  // This logic is now handled by /admin/schedules
  res.redirect('/admin/schedules');
});

module.exports = router;