import React, { useState, useEffect, useContext } from 'react';
import { fetchUser } from '../services/UserService';
import '../styles/UserProfile.css';

const UserProfilePage = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState(null);  

  useEffect(() => {
    const fetchUserData = async () => {
      setError(null);
      try {
        const userData = await fetchUser(); // Fetch user data from backend
        setUser(userData);
      } catch (error) {
        setError(error || 'An error occurred during fetching user profile.');
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="user-profile-container">
      <div className="profile-section">
        <h2>User Profile</h2>
        <h3>Profile Information</h3>
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
        <div>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;