const moment = require('moment');
const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const io = require('../Server').io;
const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_SECRET || 'your_jwt_secret';
const notificationsJobSchedule = process.env.NOTIFICATIONS_JOB_SCHEDULE || '*/30 * * * *';

// Function to send "Due Soon" notifications
async function sendDueSoonNotifications(tasks) {
    for (const task of tasks) {
      try {
        const user = await User.findById(task.user._id);
        if (user && user.notifications.dueSoon) { // Check notification preference
          io.to(user._id.toString()).emit('dueSoonNotification', task);
        }
      } catch (error) {
        console.error(`Error sending due soon notification for task ${task._id}:`, error);
      }
    }
  }
  
  // Function to send "Overdue" notifications
  async function sendOverdueNotifications(tasks) {
    for (const task of tasks) {
      try {
        const user = await User.findById(task.user._id);
        if (user && user.notifications.overdue) { // Check notification preference
          io.to(user._id.toString()).emit('overdueNotification', task);
        }
      } catch (error) {
        console.error(`Error sending overdue notification for task ${task._id}:`, error);
      }
    }
  }

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    const token = socket.handshake.query.token; 
  
    if (token) {
      try {
        const decoded = jwt.verify(token, accessTokenSecret);
        socket.userId = decoded.userId; // Store userId on the socket object
        socket.join(socket.userId); // Join the user's room
      } catch (err) {
        console.error('Invalid token:', err);
        // Handle invalid token (e.g., disconnect the socket)
        socket.disconnect(); 
      }
    } else {
      console.error('No token provided for Socket.IO connection.');
      // Handle missing token (e.g., disconnect the socket)
      socket.disconnect();
    }
  });

cron.schedule(notificationsJobSchedule, async () => {
  try {
    const currentDate = moment().utc();
    const dueSoonDate = moment().utc().add(24, 'hours'); // 24 hours from now

    // Find tasks due soon (within the next 24 hours)
    const dueSoonTasks = await Task.find({
        dueDate: { $gte: currentDate, $lt: dueSoonDate },
    }).populate('user', '_id notifications');

    // Find overdue tasks
    const overdueTasks = await Task.find({
      dueDate: { $lt: currentDate },
    }).populate('user', '_id notifications');;

    // Send notifications
    await sendDueSoonNotifications(dueSoonTasks);
    await sendOverdueNotifications(overdueTasks);

  } catch (error) {
    console.error('Error checking for due tasks:', error);
  }
});