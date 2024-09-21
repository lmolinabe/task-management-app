const moment = require('moment');
const cron = require('node-cron');
const Task = require('../../../src/models/Task');
const User = require('../../../src/models/User');
const { io } = require('../../../src/Server');
const jwt = require('jsonwebtoken');
const { 
  sendDueSoonNotifications, 
  sendOverdueNotifications, 
} = require('../../../src/jobs/NotificationsJob');

// Mock data for testing
const accessTokenSecret = 'your_test_secret';
const notificationsJobSchedule = process.env.NOTIFICATIONS_JOB_SCHEDULE || '*/30 * * * *';
const mockTasks = [
  { _id: '1', title: 'Task 1', dueDate: moment().utc().add(12, 'hours').toDate(), user: { _id: 'user1', notifications: { dueSoon: true } } },
  { _id: '2', title: 'Task 2', dueDate: moment().utc().subtract(2, 'days').toDate(), user: { _id: 'user2', notifications: { overdue: true } } },
];

jest.mock('node-cron');
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/Task', () => ({
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
  }),
}));
jest.mock('../../../src/models/User');
jest.mock('socket.io');
jest.mock('../../../src/Server', () => ({
  io: {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    on: jest.fn(),
  },
}));

describe('NotificationsJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendDueSoonNotifications', () => {
    it('should send due soon notifications to users with dueSoon enabled', async () => {
      User.findById.mockResolvedValueOnce(mockTasks[0].user);

      await sendDueSoonNotifications([mockTasks[0]]);

      expect(io.to).toHaveBeenCalledWith(mockTasks[0].user._id.toString());
      expect(io.emit).toHaveBeenCalledWith('dueSoonNotification', mockTasks[0]);
    });

    it('should not send due soon notifications if dueSoon is disabled', async () => {
      const user = { ...mockTasks[0].user, notifications: { dueSoon: false } };
      User.findById.mockResolvedValueOnce(user);

      await sendDueSoonNotifications([mockTasks[0]]);

      expect(io.to).not.toHaveBeenCalled();
      expect(io.emit).not.toHaveBeenCalled();
    });
  });

  describe('sendOverdueNotifications', () => {
    it('should send overdue notifications to users with overdue enabled', async () => {
      User.findById.mockResolvedValueOnce(mockTasks[1].user);

      await sendOverdueNotifications([mockTasks[1]]);

      expect(io.to).toHaveBeenCalledWith(mockTasks[1].user._id.toString());
      expect(io.emit).toHaveBeenCalledWith('overdueNotification', mockTasks[1]);
    });

    it('should not send overdue notifications if overdue is disabled', async () => {
      const user = { ...mockTasks[1].user, notifications: { overdue: false } };
      User.findById.mockResolvedValueOnce(user);

      await sendOverdueNotifications([mockTasks[1]]);

      expect(io.to).not.toHaveBeenCalled();
      expect(io.emit).not.toHaveBeenCalled();
    });
  });
});