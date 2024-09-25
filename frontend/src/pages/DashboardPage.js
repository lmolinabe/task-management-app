import React, { useEffect, useState } from 'react';
import AppBackendApi from '../apis/BackendApi';
import { fetchTaskSummary } from '../services/TaskService';
import '../styles/Dashboard.css';

const DashboardPage = () => {
    const [csrfToken, setCsrfToken] = useState(null);
    const [taskSummary, setTaskSummary] = useState({
        totalTasks: 0,
        dueSoon: 0,
        completedTasks: 0
    });

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
        const loadTaskSummary = async () => {
          if (csrfToken) {
            try {
              const summary = await fetchTaskSummary(csrfToken);
              setTaskSummary(summary);
            } catch (error) {
              console.error('Failed to fetch task summary', error);
            }
          }
        };
    
        loadTaskSummary();
      }, [csrfToken]);

    return (
        <div className="dashboard">
            <h2>Task Management Dashboard</h2>
            <div className="dashboard-container">
                <div className="dashboard-card">
                    <div className="card-header">Total Tasks</div>
                    <div className="card-body">{taskSummary.totalTasks}</div>
                </div>
                <div className="dashboard-card">
                    <div className="card-header">Completed Tasks</div>
                    <div className="card-body">{taskSummary.completedTasks}</div>
                </div>                                                
                <div className="dashboard-card">
                    <div className="card-header">Overdue Tasks</div>
                    <div className="card-body">{taskSummary.overdueTasks}</div>
                </div>
                <div className="dashboard-card">
                    <div className="card-header">Due Soon Tasks</div>
                    <div className="card-body">{taskSummary.dueSoonTasks}</div>
                </div>                
                <div className="dashboard-card">
                    <div className="card-header">On Time Tasks</div>
                    <div className="card-body">{taskSummary.onTimeTasks}</div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;