const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const RouteRequest = require('../models/RouteRequest');
const Route = require('../models/Route');

// Show the user's profile page
router.get('/profile', isAuthenticated, async (req, res) => {
  if (req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  if (req.session.user.role === 'driver') {
    return res.redirect('/driver/dashboard');
  }

  try {
    const user = await User.findById(req.session.user._id).populate('route');
    // Save the fresh user data into the session, just in case
    req.session.user = user; 
    
    res.render('profile', { 
      title: 'My Profile', 
      page: 'profile', 
      currentUser: user 
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Show the 'Edit Profile' form
router.get('/profile/edit', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render('edit-profile', {
      title: 'Edit Profile',
      page: 'profile',
      currentUser: user
    });
  } catch (err) {
    console.error(err);
    res.redirect('/profile');
  }
});

// Handle the 'Edit Profile' form submission
router.post('/profile/edit', isAuthenticated, async (req, res) => {
  try {
    const { name, phone, studentId, college, course, year, sem } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      { name, phone, studentId, college, course, year, sem },
      { new: true }
    );
    req.session.user = updatedUser; // Update the session
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.redirect('/profile/edit?error=1');
  }
});


// Show the request form
router.get('/profile/request-change', isAuthenticated, async (req, res) => {
  try {
    const existingRequest = await RouteRequest.findOne({ 
      user: req.session.user._id, 
      status: 'pending' 
    });

    if (existingRequest) {
      return res.redirect('/profile?error=pending');
    }

    const allRoutes = await Route.find();
    
    res.render('request_change', {
      title: 'Request Route Change',
      page: 'profile',
      currentUser: req.session.user,
      routes: allRoutes 
    });

  } catch (err) {
    console.error(err);
    res.redirect('/profile');
  }
});

// Handle the request form submission
router.post('/profile/request-change', isAuthenticated, async (req, res) => {
  try {
    const { newRouteId, newStopName, reason } = req.body;

    // ✅ FIX 1: Get the FRESH user data from the database
    const freshUser = await User.findById(req.session.user._id);

    // Create the new request
    const request = new RouteRequest({
      user: req.session.user._id,
      currentRoute: freshUser.route, // ✅ FIX 2: Use the fresh 'user.route'
      requestedRoute: newRouteId,
      requestedStopName: newStopName,
      reason: reason
    });
    
    await request.save();
    
    res.redirect('/profile?success=request-sent');
  } catch (err) {
    console.error(err);
    res.redirect('/profile/request-change?error=1');
  }
});

module.exports = router;