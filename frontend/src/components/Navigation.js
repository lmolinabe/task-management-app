import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavLink, Link } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = () => {
    const { user, logout } = useContext(AuthContext);

    if(!user) {
        return (<div></div>);
    }

    return (
        <nav className="navigation">
            <ul>
                <li>
                    <NavLink to="/dashboard" exact activeClassName="active-link">Dashboard</NavLink>
                </li>
                <li>
                    <NavLink to="/tasks" exact activeClassName="active-link">Tasks</NavLink>
                </li>
                <li>
                    <NavLink to="/profile" exact activeClassName="active-link">Profile</NavLink>
                </li>
                <li>
                    <NavLink to="/settings" exact activeClassName="active-link">Settings</NavLink>
                </li>
                <li>
                    <Link to="/" onClick={logout}>Logout</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;