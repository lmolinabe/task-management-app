const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/Auth');
const taskRoutes = require('./routes/Tasks');

dotenv.config();

// Connect Database
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(helmet());
app.use(morgan('common'));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling, etc.
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found.' });
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });