const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');

// Import all models
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const RouteRequest = require('../models/RouteRequest');

// Admin Dashboard
router.get('/dashboard', isAdmin, (req, res) => {
  res.render('admin/dashboard', { 
    title: 'Admin Dashboard',
    page: 'dashboard', 
    currentUser: req.session.user 
  });
});

// --- Manage Users ---
router.get('/users', isAdmin, async (req, res) => {
  const users = await User.find().populate('route');
  res.render('admin/manage_users', { 
    title: 'Manage Users',
    page: 'dashboard',
    users, 
    currentUser: req.session.user 
  });
});

router.post('/users', isAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = new User({ name, email, password, role });
  await user.save();
  res.redirect('/admin/users');
});

// --- Edit User Routes ---
router.get('/users/edit/:id', isAdmin, async (req, res) => {
  try {
    const userToEdit = await User.findById(req.params.id);
    const allRoutes = await Route.find(); 
    if (!userToEdit) {
      return res.redirect('/admin/users');
    }
    res.render('admin/edit_user', {
      title: 'Edit User',
      page: 'dashboard',
      currentUser: req.session.user,
      userToEdit: userToEdit,
      allRoutes: allRoutes
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/users');
  }
});

// --- Handle the edit user form submission (UPDATED) ---
router.post('/users/update/:id', isAdmin, async (req, res) => {
  try {
    // ✅ 1. Get the new field from the form
    const { name, email, role, route, homeStopName } = req.body;
    
    // ✅ 2. Find user and update them
    await User.findByIdAndUpdate(req.params.id, {
      name,
      email,
      role,
      route: route || null,
      homeStopName: homeStopName // ✅ 3. Save the new field
    });
    
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/users');
  }
});


// --- Manage Vehicles ---
router.get('/vehicles', isAdmin, async (req, res) => {
  const vehicles = await Vehicle.find();
  res.render('admin/manage_vehicles', { 
    title: 'Manage Vehicles',
    page: 'dashboard', 
    vehicles, 
    currentUser: req.session.user 
  });
});

router.post('/vehicles', isAdmin, async (req, res) => {
  const { vehicleNumber, model, capacity } = req.body;
  const vehicle = new Vehicle({ vehicleNumber, model, capacity });
  await vehicle.save();
  res.redirect('/admin/vehicles');
});

// --- Manage Routes ---
router.get('/routes', isAdmin, async (req, res) => {
  const routes = await Route.find();
  res.render('admin/manage_routes', { 
    title: 'Manage Routes',
    page: 'dashboard', 
    routes, 
    currentUser: req.session.user 
  });
});

router.post('/routes', isAdmin, async (req, res) => {
  const { name } = req.body;
  const route = new Route({ name, stops: [] });
  await route.save();
  res.redirect('/admin/routes');
});

// --- Edit Route Routes ---
router.get('/routes/edit/:id', isAdmin, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.redirect('/admin/routes');
    }
    res.render('admin/edit_route', {
      title: 'Edit Route',
      page: 'dashboard',
      route: route,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/routes');
  }
});

router.post('/routes/update/:id', isAdmin, async (req, res) => {
  try {
    await Route.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.redirect('/admin/routes/edit/' + req.params.id);
  } catch (err) {
    console.error(err);
    res.redirect('/admin/routes/edit/' + req.params.id);
  }
});

router.post('/routes/add-stop/:id', isAdmin, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.redirect('/admin/routes');
    }
    const { name, lat, lng, sequence } = req.body;
    const newStop = {
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      sequence: parseInt(sequence)
    };
    route.stops.push(newStop);
    await route.save();
    res.redirect('/admin/routes/edit/' + req.params.id);
  } catch (err) {
    console.error(err);
    res.redirect('/admin/routes/edit/' + req.params.id);
  }
});

router.post('/routes/delete-stop/:routeId/:stopId', isAdmin, async (req, res) => {
  try {
    await Route.findByIdAndUpdate(req.params.routeId, {
      $pull: {
        stops: { _id: req.params.stopId }
      }
    });
    res.redirect('/admin/routes/edit/' + req.params.routeId);
  } catch (err) {
    console.error(err);
    res.redirect('/admin/routes/edit/' + req.params.routeId);
  }
});


// --- Manage Schedules ---
router.get('/schedules', isAdmin, async (req, res) => {
  const schedules = await Schedule.find().populate('route driver vehicle');
  const routes = await Route.find();
  const drivers = await User.find({ role: 'driver' });
  const vehicles = await Vehicle.find();
  
  res.render('admin/manage_schedules', { 
    title: 'Manage Schedules',
    page: 'dashboard', 
    schedules,
    routes,
    drivers,
    vehicles,
    currentUser: req.session.user 
  });
});

router.post('/schedules', isAdmin, async (req, res) => {
  const days = Array.isArray(req.body.daysActive) ? req.body.daysActive : [req.body.daysActive];
  const schedule = new Schedule({
    route: req.body.route,
    driver: req.body.driver,
    vehicle: req.body.vehicle,
    departureTime: req.body.departureTime,
    estimatedArrivalTime: req.body.estimatedArrivalTime,
    daysActive: days
  });
  await schedule.save();
  res.redirect('/admin/schedules');
});

// --- Manage Route Requests ---
router.get('/requests', isAdmin, async (req, res) => {
  try {
    const allRequests = await RouteRequest.find()
      .populate('user', 'name email')
      .populate('currentRoute', 'name')
      .populate('requestedRoute', 'name')
      .sort({ createdAt: -1 });

    const requests = {
      pending: allRequests.filter(r => r.status === 'pending'),
      approved: allRequests.filter(r => r.status === 'approved'),
      rejected: allRequests.filter(r => r.status === 'rejected')
    };
      
    res.render('admin/manage_requests', {
      title: 'Manage Requests',
      page: 'dashboard',
      requests: requests,
      currentUser: req.session.user
    });
  } catch(err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
});

router.post('/requests/approve/:requestId', isAdmin, async (req, res) => {
  try {
    const request = await RouteRequest.findById(req.params.requestId);
    request.status = 'approved';
    await request.save();
    res.redirect('/admin/requests');
  } catch(err) {
    console.error(err);
    res.redirect('/admin/requests?error=1');
  }
});

router.post('/requests/reject/:requestId', isAdmin, async (req, res) => {
  try {
    await RouteRequest.findByIdAndUpdate(req.params.requestId, { status: 'rejected' });
    res.redirect('/admin/requests');
  } catch(err) {
    console.error(err);
    res.redirect('/admin/requests?error=1');
  }
});

module.exports = router;