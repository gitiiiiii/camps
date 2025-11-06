const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// This is the route that was crashing
router.get('/', async (req, res) => {
  try {
    // The query is simple: just find all routes.
    // We remove .populate('driver') because that field is not in the Route model.
    const routes = await Route.find();
    
    // This now matches the variable 'currentUser' you use in your EJS files
    res.render('routes', { 
      title: 'Bus Routes', 
      page: 'routes', 
      routes: routes,
      currentUser: req.session.user || null 
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
