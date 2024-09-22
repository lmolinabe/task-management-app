import React, { useContext, useEffect  } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Home.css';

const HomePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
          navigate('/dashboard');
        }
      }, [user]);

    return (
        <div className="home">
            <h1>Welcome to Task Management App</h1>
            <p>Please login or sign up to get started.</p>
            <div className="home-buttons">
                <Link to="/login" className="button">Login</Link>
                <Link to="/signup" className="button">Sign Up</Link>
            </div>
        </div>
    );
};

export default HomePage;