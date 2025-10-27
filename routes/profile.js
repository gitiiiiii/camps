const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('profile', { title: 'My Profile', page: 'profile', currentUser: req.session.user });
});

module.exports = router;
