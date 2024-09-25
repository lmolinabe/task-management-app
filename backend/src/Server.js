const express = require('express');
const cookieParser = require('cookie-parser');
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
const csrfTokenGenerator = require('./middleware/CsrfTokenGenerator');
const csrfTokenValidator = require('./middleware/CsrfTokenValidator');


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
app.use(cors({ origin: process.env.APP_FRONTEND_URL, credentials: true }));
app.use(csrfTokenGenerator);

// Routes
app.get('/api/csrf-token', (req, res) => {
  // Send the token from the cookie in the response
  res.json({ csrfToken: req.cookies['csrf-token'] });
});
app.use('/api/auth', authRoutes);
app.use('/api/tasks', csrfTokenValidator, taskRoutes);
app.use('/api/users', csrfTokenValidator, usersRoutes);

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