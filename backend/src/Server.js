const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/Auth');
const taskRoutes = require('./routes/Tasks');
const usersRoutes = require('./routes/Users');
const app = express();
const server = http.createServer(app); // Create the server instance
const io = socketIo(server, { // Attach Socket.IO to the server
  cors: {
    origin: process.env.APP_FRONTEND_URL, // Allow requests from this origin
    methods: ['GET', 'POST'], // Allow these HTTP methods
  }
});

dotenv.config();

// Connect Database
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(helmet());
app.use(morgan('common'));
app.use(cors({ origin: process.env.APP_FRONTEND_URL }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', usersRoutes);

// Error handling, etc.
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found.' });
  });

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    require('./jobs/NotificationsJob');
  });

  module.exports = { app, io };  