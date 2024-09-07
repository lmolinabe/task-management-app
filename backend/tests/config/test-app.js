const express = require('express');
const authRoutes = require('../../src/routes/Auth');
const taskRoutes = require('../../src/routes/Tasks');

module.exports = () => {
    const app = express();
    app.use(express.json()); // Body-parser middleware

    // Apply your routes
    app.use('/api/auth', authRoutes);
    app.use('/api/tasks', taskRoutes);

    // Error handling (important for testing)
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Something broke!' });
    });

    return app;
};
