const express = require('express');
const router = express.Router();
const { isAuthenticated, isUser } = require('../middleware/auth');

// Show the user's profile page
// We use 'isAuthenticated' to ensure they are logged in.
router.get('/profile', isAuthenticated, (req, res) => {
  // We can render a different profile based on role if we want,
  // or just use one 'profile.ejs' template.
  
  if (req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  if (req.session.user.role === 'driver') {
    return res.redirect('/driver/dashboard');
  }

  res.render('user/profile', { page: 'profile' });
});

module.exports = router;