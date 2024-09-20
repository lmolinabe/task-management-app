import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchUser, updateUser } from '../services/UserService';
import '../styles/UserSettings.css';

const UserSettingsPage = () => {
  const [notifications, setNotifications] = useState({
    dueSoon: false,
    overdue: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserSettings = async () => {
      setError(null);
      try {
        const userData = await fetchUser();
        setNotifications({
          dueSoon: userData.notifications?.dueSoon || false, // Handle cases where notifications might be undefined
          overdue: userData.notifications?.overdue || false,
        });
      } catch (error) {
        setError(error || 'An error occurred during fetching user settings.');
      }
    };

    fetchUserSettings();
  }, []);

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handleSaveSettings = async () => {
    setError(null);
    try {
      await updateUser({ notifications }); // Update user settings in the backend
      // Optionally display a success message
    } catch (error) {
      setError(error || 'An error occurred during updating user settings.');
    }
  };

  return (
    <div className="user-settings-container">
      <h2>User Settings</h2>
      <h3>Notification Preferences</h3>
      {error && (
          <div className="error-message">
          {Array.isArray(error) ? (
              <ul>
              {error.map((err, index) => (
                  <li key={index}>{err.msg || err}</li> // Display err.msg if available, otherwise err
              ))}
              </ul>
          ) : (
              <p>{error}</p>
          )}
          </div>
      )}
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