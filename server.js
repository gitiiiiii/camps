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
const driverRoutes = require('./routes/driver');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ Mongo connect error', err);
    process.exit(1);
  });

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 1. Create the session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
});

// ✅ 2. Use the session middleware for Express
app.use(sessionMiddleware);

// ✅ 3. Share the session middleware with Socket.IO
io.engine.use(sessionMiddleware);

// Global variables for EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentUser = req.session.user || null;
  res.locals.page = '';
  next();
});

// Inject socket.io into routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/routes', routeRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/', profileRoute);
app.use('/tracking', trackingRoutes);
app.use('/admin', adminRoutes);
app.use('/driver', driverRoutes);

// Home Routes
app.get("/", (req, res) => {
  res.render("index", { 
    title: "Home - College Transport", 
    page: "home",
    currentUser: req.session.user || null
  });
});

// ... (Your other app.get routes are now handled by routes/public.js or routes/tracking.js) ...

// ✅ 4. Socket.IO connection now has access to the user's session
io.on('connection', (socket) => {
  console.log('🟢 A user connected');
  
  // Check if the user is logged in
  const session = socket.request.session;
  if (session && session.user) {
    // This socket is authenticated!
    const userId = session.user._id.toString();
    
    // Join a "room" named after their own User ID.
    // This allows us to send a message to *only* this user.
    socket.join(userId);
    console.log(`Socket ${socket.id} authenticated for user ${userId}`);
  }

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

// Start Server
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));