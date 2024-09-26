import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import UserSettingsPage from '../../../src/pages/UserSettingsPage';
import { fetchUser as getUser, updateUser } from '../../../src/services/UserService';
import AppBackendApi from '../../../src/apis/BackendApi';
import { AuthContext } from '../../../src/context/AuthContext';

// Mock the UserService functions
jest.mock('../../../src/services/UserService');
// Mock the Backend API
jest.mock('../../../src/apis/BackendApi');

beforeEach(() => {
  // Mock the CSRF token fetch
  AppBackendApi.get.mockResolvedValue({ data: { csrfToken: 'mock-csrf-token' } });    
});

describe('UserSettingsPage', () => {
  it('fetches and displays user settings', async () => {
    // Mock user data with notification settings
    const mockUserData = {
      notifications: {
        dueSoon: true,
        overdue: false,
      },
    };

    // Mock the fetchUser service to return the mock data
    getUser.mockResolvedValue(mockUserData);

    // Mock the entire AuthContext value
    const mockAuthContext = {
      fetchUser: jest.fn(),
    };

    // Render the UserSettingsPage component
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserSettingsPage />
      </AuthContext.Provider>
    );

    await act(() => Promise.resolve()); // Wait for the promise to resolve    

    // Assert that the checkboxes reflect the fetched settings
    expect(await screen.findByLabelText('Due Soon Notifications')).toBeChecked();
    expect(await screen.findByLabelText('Overdue Notifications')).not.toBeChecked();
  });

  it('updates user settings on save', async () => {
    // Mock the updateUser service to resolve (simulate successful update)
    updateUser.mockResolvedValueOnce();

    // Mock the entire AuthContext value
    const mockAuthContext = {
      fetchUser: jest.fn(),
    };

    // Render the UserSettingsPage component
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserSettingsPage />
      </AuthContext.Provider>
    );
  
    // Wrap all actions and assertions within a single act block
    await act(async () => {
      // Change the notification settings
      fireEvent.click(screen.getByLabelText('Overdue Notifications')); // Enable overdue notifications
  
      // Click the "Save Settings" button
      fireEvent.click(screen.getByText('Save'));
  
      // Wait for the promise to resolve (if updateUser returns a promise)
      await Promise.resolve(); 
  
      // Assert that updateUser was called with the expected data
      expect(updateUser).toHaveBeenCalled();
    });
  });

  it('displays an error message if fetching user settings fails', async () => {
    // Mock the fetchUser service to throw an error
    const errorMessage = 'Failed to fetch user settings';
    getUser.mockRejectedValue(errorMessage);

    // Mock the entire AuthContext value
    const mockAuthContext = {
      fetchUser: jest.fn(),
    };

    // Render the UserSettingsPage component
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserSettingsPage />
      </AuthContext.Provider>
    );

    // Wait for the error message to appear
    const errorElement = await screen.findByText(errorMessage);

    // Assert that the error message is displayed
    expect(errorElement).toBeInTheDocument();
  });
});