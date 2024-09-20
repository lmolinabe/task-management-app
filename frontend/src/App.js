import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';
import Notifications from './components/Notifications';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Tasks from './pages/TasksPage';
import Profile from './pages/UserProfilePage';
import Settings from './pages/UserSettingsPage';

const App = () => {
    return (
        <Router>
            <div className="app">
                <Navigation />
                <Notifications />
                <main>
                    <Routes >
                        <Route path="/" exact element={<HomePage/>} />
                        <Route path="/signup" element={<SignupPage/>} />
                        <Route path="/login" element={<LoginPage/>} />                      
                        <Route path="/dashboard" element={<PrivateRoute><DashboardPage/></PrivateRoute>} />
                        <Route path="/tasks" element={<PrivateRoute><Tasks/></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />
                        <Route path="/settings" element={<PrivateRoute><Settings/></PrivateRoute>} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes >
                </main>
            </div>
        </Router>
    );
};

export default App;