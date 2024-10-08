import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AppBackendApi from '../apis/BackendApi';
import '../styles/Login.css';

const LoginPage = () => {
    const [csrfToken, setCsrfToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

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

        if (user) {
          navigate('/dashboard');
        }
      }, [user]);    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            setError(error || 'An error occurred during login.');
        }
    };

    return (
        <div className="login-form-container">
            <h2>Welcome back</h2>
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
            <form className="login-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                <p>Don&apos;t have an account? <Link to="/signup">Sign Up</Link></p>
            </form>
        </div>
    );
};

export default LoginPage;
