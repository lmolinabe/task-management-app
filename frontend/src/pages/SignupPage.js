import React, { useState, useContext } from 'react';
import { useNavigate, Link  } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Signup.css';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);    
    const { user, signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await signup(name, email, password);
            navigate('/login');
        } catch (error) {
            setError(error || 'An error occurred during sign up.');
        }
    };

    if (user) {
        return navigate('/dashboard');
    }    

    return (
        <div className="signup-form-container">
            <h2>Create an account</h2>
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
            <form className="signup-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder='Name'
                />                
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder='Email'
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder='Password'
                />
                <button type="submit">Sign Up</button>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
};

export default SignupPage;