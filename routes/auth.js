const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// register (students & faculty)
router.get('/register', (req,res)=> res.render('register'));
router.post('/register', async (req,res)=>{
  try {
    const { name,email,password,role,phone } = req.body;
    if (!name||!email||!password||!role) return res.redirect('/register?error=Missing+fields');
    const exists = await User.findOne({ email });
    if (exists) return res.redirect('/register?error=User+exists');
    const hash = await bcrypt.hash(password,10);
    const user = new User({ name,email,password:hash,role,phone });
    await user.save();
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch(err){ console.error(err); res.redirect('/register?error=Server'); }
});

// login
router.get('/login', (req,res)=> res.render('login'));
router.post('/login', async (req,res)=>{
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.redirect('/login?error=Invalid+credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.redirect('/login?error=Invalid+credentials');
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch(err){ console.error(err); res.redirect('/login?error=Server'); }
});

// logout
router.post('/logout', (req,res)=>{
  req.session.destroy(()=> res.redirect('/'));
});

module.exports = router;
