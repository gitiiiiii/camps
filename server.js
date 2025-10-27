require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const http = require('http');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes');
const scheduleRoutes = require('./routes/schedules');
const profileRoute = require('./routes/profile');
const trackingRoutes = require('./routes/tracking');
const adminRoutes = require('./routes/admin');
const driverRoutes = require('./routes/driver'); // 👈 Add driver route

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ Mongo connect error', err);
    process.exit(1);
  });

// ✅ View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// ✅ Global variables for EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentUser = req.session.user || null;
  res.locals.page = '';
  next();
});

// ✅ Inject socket.io into routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Routes
app.use('/', authRoutes);
app.use('/routes', routeRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/', profileRoute);
app.use('/tracking', trackingRoutes);
app.use('/admin', adminRoutes);
app.use('/driver', driverRoutes); // 👈 Add driver route

// ✅ Home Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Home - College Transport", page: "home" });
});

app.get("/routes", (req, res) => {
  res.render("routes", { title: "Routes", page: "routes" });
});

app.get("/schedules", (req, res) => {
  res.render("schedules", { title: "Schedules", page: "schedules" });
});

app.get("/tracking", (req, res) => {
  res.render("tracking", { title: "Real-time Tracking", page: "track" });
});

app.get("/profile", (req, res) => {
  res.render("profile", {
    title: "My Profile",
    currentUser: req.session.user || null
  });
});

// ✅ Socket.IO connection
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

// ✅ Start Server
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
