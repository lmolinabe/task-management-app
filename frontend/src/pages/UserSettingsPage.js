import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUser, updateUser } from '../services/UserService';
import '../styles/UserSettings.css';

const UserSettingsPage = () => {
  const [notifications, setNotifications] = useState({
    dueSoon: false,
    overdue: false,
  });

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const userData = await fetchUser();
        setNotifications({
          dueSoon: userData.notifications?.dueSoon || false, // Handle cases where notifications might be undefined
          overdue: userData.notifications?.overdue || false,
        });
      } catch (error) {
        console.error('Error fetching user settings:', error);
        // Handle error, e.g., display an error message
      }
    };

    fetchUserSettings();
  }, []);

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handleSaveSettings = async () => {
    try {
      await updateUser({ notifications }); // Update user settings in the backend
      // Optionally display a success message
    } catch (error) {
      console.error('Error updating settings:', error);
      // Handle error, e.g., display an error message
    }
  };

  return (
    <div className="user-settings-container">
      <h2>User Settings</h2>
      <h3>Notification Preferences</h3>
      <div className="setting">
        <label htmlFor="dueSoon">
          <input
            type="checkbox"
            id="dueSoon"
            name="dueSoon"
            checked={notifications.dueSoon}
            onChange={handleNotificationChange}
          />
          Due Soon Notifications
        </label>
      </div>
      <div className="setting">
        <label htmlFor="overdue">
          <input
            type="checkbox"
            id="overdue"
            name="overdue"
            checked={notifications.overdue}
            onChange={handleNotificationChange}
          />
          Overdue Notifications
        </label>
      </div>
      <button onClick={handleSaveSettings}>Save Settings</button>
    </div>
  );
};

export default UserSettingsPage;