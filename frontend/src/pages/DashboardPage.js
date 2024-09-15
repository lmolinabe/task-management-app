import React, { useEffect, useState } from 'react';
import { fetchTaskSummary } from '../services/TaskService';
import '../styles/Dashboard.css';

const DashboardPage = () => {
    const [taskSummary, setTaskSummary] = useState({
        totalTasks: 0,
        dueSoon: 0,
        completedTasks: 0
    });

    useEffect(() => {
        const loadTaskSummary = async () => {
            try {
                const summary = await fetchTaskSummary();
                setTaskSummary(summary);
            } catch (error) {
                console.error('Failed to fetch task summary', error);
            }
        };

        loadTaskSummary();
    }, []);

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