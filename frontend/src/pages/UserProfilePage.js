import React, { useState, useEffect, useContext } from 'react';
import { fetchUser } from '../services/UserService';
import '../styles/UserProfile.css';

const UserProfilePage = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUser(); // Fetch user data from backend
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error, e.g., display an error message
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="user-profile-container">
      <div className="profile-section">
        <h2>User Profile</h2>
        <h3>Profile Information</h3>        
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