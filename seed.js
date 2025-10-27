require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Route = require('./models/Route');

async function seed(){
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Route.deleteMany({});
  const admin = new User({ name:'Admin', email:'admin@college.edu', password: await bcrypt.hash('AdminPass1',10), role:'admin' });
  const driver = new User({ name:'Driver One', email:'driver1@college.edu', password: await bcrypt.hash('DriverPass1',10), role:'driver', vehicleInfo:'Bus 12' });
  await admin.save(); await driver.save();
  const r = new Route({ title:'North Loop', code:'N1', stops:[{name:'Gate A',lat:12.97,lng:77.59,sequence:1},{name:'Library',lat:12.971,lng:77.6,sequence:2}], driver: driver._id });
  await r.save();
  console.log('Seeded admin and driver. Admin: admin@college.edu / AdminPass1, Driver: driver1@college.edu / DriverPass1');
  process.exit(0);
}
seed();
