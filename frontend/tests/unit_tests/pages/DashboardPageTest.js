import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import DashboardPage from '../../../src/pages/DashboardPage';
import { fetchTaskSummary } from '../../../src/services/TaskService';
import AppBackendApi from '../../../src/apis/BackendApi';

// Mock the fetchTaskSummary service
jest.mock('../../../src/services/TaskService');
// Mock the Backend API
jest.mock('../../../src/apis/BackendApi');

describe('DashboardPage', () => {
    beforeEach(() => {
        // Mock the CSRF token fetch
        AppBackendApi.get.mockResolvedValueOnce({ data: { csrfToken: 'mock-csrf-token' } });    
    });

    it('renders the dashboard with task summary data', async () => {
        // Mock task summary data
        const mockSummary = {
            totalTasks: 10,
            dueSoonTasks: 1,
            completedTasks: 2,
            overdueTasks: 3,
            onTimeTasks: 4,
        };

        // Mock the fetchTaskSummary service to return the mock data
        fetchTaskSummary.mockResolvedValue(mockSummary);

        // Render the DashboardPage component
        render(<DashboardPage />);

        expect(await screen.findByText('Task Management Dashboard')).toBeInTheDocument();
        expect(await screen.findByText('Total Tasks')).toBeInTheDocument();
        expect(await screen.findByText(mockSummary.totalTasks)).toBeInTheDocument();
        expect(await screen.findByText('Completed Tasks')).toBeInTheDocument();
        expect(await screen.findByText(mockSummary.completedTasks)).toBeInTheDocument();
        expect(await screen.findByText('Overdue Tasks')).toBeInTheDocument();
        expect(await screen.findByText(mockSummary.overdueTasks)).toBeInTheDocument();
        expect(await screen.findByText('Due Soon Tasks')).toBeInTheDocument();
        expect(await screen.findByText(mockSummary.dueSoonTasks)).toBeInTheDocument();
        expect(await screen.findByText('On Time Tasks')).toBeInTheDocument();
        expect(await screen.findByText(mockSummary.onTimeTasks)).toBeInTheDocument();
    });
});