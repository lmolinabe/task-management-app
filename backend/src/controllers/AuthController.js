const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Set JWT secrets (keep these secure - use environment variables in production)
const accessTokenSecret = process.env.JWT_SECRET || 'your_jwt_secret';
const accessToken_expires_in = process.env.JWT_EXPIRES_IN || '1h';
const refreshTokenSecret = process.env.REFRESH_JWT_SECRET || 'your_refresh_jwt_secret_key';
const refreshToken_expires_in = process.env.REFRESH_JWT_EXPIRES_IN || '6h';

// Function to generate access token
const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, accessTokenSecret, { expiresIn: accessToken_expires_in });
};
  
// Function to generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, refreshTokenSecret, { expiresIn: refreshToken_expires_in });
};

// Controller for user sign up
exports.signup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { name, email, password } = req.body;
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
        });

        // // Hash the password
        const saltRounds = 10;
        user.password = await bcrypt.hash(password, saltRounds);

        // Save user to the database
        await user.save();

        // Generate access and refresh tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save accessToken and refreshToken to the database
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();       
        
        // Send tokens in response
        res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error.' });
    }
};

// Controller for user login
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { email, password } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // Generate access and refresh tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save accessToken and refreshToken to the database
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save(); 

        // Send tokens in response
        res.json({ accessToken: accessToken, refreshToken: refreshToken });        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error.' });
    }
};

// Controller for user me
exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error.' });
    }
}

// Controller for user logout
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        // Remove accessToken and refreshToken from the database
        user.accessToken = 'logged_out';
        user.refreshToken = 'logged_out';
        await user.save();         
        res.status(200).json({ msg: 'Logged out successfully.' }); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller for user logout
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required.' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, refreshTokenSecret);
        // Find user by userId from decoded token
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: 'Invalid refresh token.' });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        // Save newAccessToken to the database
        user.accessToken = newAccessToken;
        await user.save();

        // Send new access token in response
        res.json({ accessToken: newAccessToken });

    } catch (err) {
        console.error(err.message);
        res.status(403).json({ error: 'Invalid refresh token.' });
    }
};