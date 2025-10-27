const express = require('express');
const router = express.Router();
const RouteModel = require('../models/Route');
const User = require('../models/User');

// list routes (public)
router.get('/', async (req,res)=>{
  const routes = await RouteModel.find().populate('driver','name email');
  res.render('routes', { routes });
});

// admin add form
router.get('/new', async (req,res)=>{
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  const drivers = await User.find({ role:'driver' });
  res.render('route_new',{ drivers });
});

router.post('/', async (req,res)=>{
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  const { title, code, stopsJson, driver } = req.body;
  const stops = stopsJson ? JSON.parse(stopsJson) : [];
  const r = new RouteModel({ title, code, stops, driver: driver || null });
  await r.save();
  res.redirect('/routes');
});

// view route
router.get('/:id', async (req,res)=>{
  const r = await RouteModel.findById(req.params.id).populate('driver','name email');
  if (!r) return res.redirect('/routes');
  res.render('route_view',{ route: r });
});

module.exports = router;
