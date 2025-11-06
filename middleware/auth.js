// This middleware checks if a user is logged in
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    // If not logged in, redirect to the login page
    return res.redirect('/login');
  }
  next(); // User is logged in, continue
};

// This middleware checks if the logged-in user is an Admin
const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    // If not an admin, send 403 Forbidden or redirect
    return res.redirect('/');
  }
  next(); // User is an admin
};

// This middleware checks if the logged-in user is a Driver
const isDriver = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'driver') {
    // If not a driver, redirect
    return res.redirect('/');
  }
  next(); // User is a driver
};

// This middleware checks if the logged-in user is a standard User
const isUser = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isDriver,
  isUser
};