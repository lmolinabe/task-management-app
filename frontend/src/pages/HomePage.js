import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to Task Management App</h1>
      <p style={styles.paragraph}>
        Manage your tasks efficiently with our easy-to-use task management application.
      </p>
      <div style={styles.linksContainer}>
        <Link to="/signup" style={styles.link}>
          Sign Up
        </Link>
        <Link to="/login" style={styles.link}>
          Log In
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f7f7f7',
    padding: '20px',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '1.2rem',
    marginBottom: '30px',
    maxWidth: '600px',
  },
  linksContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  link: {
    padding: '10px 20px',
    fontSize: '1rem',
    color: '#fff',
    backgroundColor: '#007bff',
    textDecoration: 'none',
    borderRadius: '5px',
  },
};

export default HomePage;