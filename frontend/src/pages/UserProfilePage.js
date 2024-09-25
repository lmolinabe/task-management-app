import React, { useState, useEffect } from 'react';
import AppBackendApi from '../apis/BackendApi';
import { fetchUser } from '../services/UserService';
import '../styles/UserProfile.css';

const UserProfilePage = () => {
  const [csrfToken, setCsrfToken] = useState(null);
  const [user, setUser] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState(null);  

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await AppBackendApi.get('/api/csrf-token');
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      setError(null);
      if (csrfToken) {
        try {
          const userData = await fetchUser(csrfToken); // Fetch user data from backend
          setUser(userData);
        } catch (error) {
          setError(error || 'An error occurred during fetching user profile.');
        }
      }
    };

    fetchUserData();
  }, [csrfToken]);

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