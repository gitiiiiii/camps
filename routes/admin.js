const express = require('express');
const router = express.Router();
const Driver = require('../models/driver');

// Admin dashboard
router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard', { title: 'Admin Dashboard', page: 'admin' });
});

// Driver panel
router.get('/drivers', async (req, res) => {
  const drivers = await Driver.find();
  res.render('admin/driverPanel', { title: 'Driver Management', drivers, page: 'admin' });
});

// Add new driver
router.post('/drivers/add', async (req, res) => {
  try {
    const { name, licenseNumber, phone, assignedRoute } = req.body;
    await Driver.create({ name, licenseNumber, phone, assignedRoute });
    res.redirect('/admin/drivers');
  } catch (err) {
    console.error('Error adding driver:', err);
    res.status(500).send('Error adding driver');
  }
});

// Delete driver
router.get('/drivers/delete/:id', async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.redirect('/admin/drivers');
  } catch (err) {
    console.error('Error deleting driver:', err);
    res.status(500).send('Error deleting driver');
  }
});

module.exports = router;
