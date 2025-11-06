const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- Registration Routes ---

// Show the register page
router.get('/register', (req, res) => {
  res.render('register', { page: 'register' });
});

// Handle registration form submission (UPDATED)
router.post('/register', async (req, res) => {
  // 1. Get the new 'phone' field from the form
  const { name, email, password, role, phone } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect('/register?error=email-taken');
    }
    
    // 2. Convert 'student' or 'faculty' to the 'user' role
    let userRole = 'user'; // Default
    if (role === 'admin' || role === 'driver') {
      // This form doesn't allow this, but good to handle
      userRole = role;
    }

    const user = new User({ 
      name, 
      email, 
      password, 
      phone, // 3. Save the phone number
      role: userRole // 4. Save the converted role
    });
    
    // The 'pre-save' hook in User.js will hash the password
    await user.save();
    
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.redirect('/register?error=server');
  }
});

// --- Login Routes ---

// Show the login page
router.get('/login', (req, res) => {
  res.render('login', { page: 'login' });
});

// Handle login form submission
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.redirect('/login?error=invalid');
    }

    // Save user to session
    req.session.user = user;

    // Redirect based on role
    switch (user.role) {
      case 'admin':
        res.redirect('/admin/dashboard');
        break;
      case 'driver':
        res.redirect('/driver/dashboard');
        break;
      case 'user':
      default:
        res.redirect('/profile');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login?error=server');
  }
});

// --- Logout Route ---

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid'); 
    res.redirect('/');
  });
});

module.exports = router;
