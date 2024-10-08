const User = require('../models/User');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const UserController = {
  // Get the current user's profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.userId).select('-password'); // Exclude password
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  },

  // Update the current user's settings
  updateSettings: async (req, res) => {
    try {
      const { notifications } = req.body; // Get updatable fields from the request body
      const updateFields = {};

      // Conditionally update and sanitize fields
      if (notifications) {
        updateFields.notifications = {
          dueSoon: !!DOMPurify.sanitize(notifications.dueSoon),
          overdue: !!DOMPurify.sanitize(notifications.overdue),
        };
      }

      const user = await User.findByIdAndUpdate(
        req.userId,
        updateFields,
        { new: true, runValidators: true } // Return the updated document, run validation
      ).select('-password'); // Exclude password

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user settings' });
    }
  }  
};

module.exports = UserController;