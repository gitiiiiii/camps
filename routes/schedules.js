const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const RouteModel = require('../models/Route');

// list
router.get('/', async (req,res)=>{
  const schedules = await Schedule.find().populate('route');
  res.render('schedules',{ schedules });
});

// admin create
router.get('/new', async (req,res)=>{
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  const routes = await RouteModel.find();
  res.render('schedule_new',{ routes });
});

router.post('/', async (req,res)=>{
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  const { route, day, departureTime, arrivalTime } = req.body;
  const s = new Schedule({ route, day, departureTime, arrivalTime });
  await s.save();
  res.redirect('/schedules');
});

module.exports = router;
