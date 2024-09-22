import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import UserSettingsPage from '../../../src/pages/UserSettingsPage';
import { fetchUser, updateUser } from '../../../src/services/UserService';

// Mock the UserService functions
jest.mock('../../../src/services/UserService');

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
    fetchUser.mockResolvedValue(mockUserData);

    // Render the UserSettingsPage component
    render(<UserSettingsPage />);

    await act(() => Promise.resolve()); // Wait for the promise to resolve    

    // Assert that the checkboxes reflect the fetched settings
    expect(await screen.findByLabelText('Due Soon Notifications')).toBeChecked();
    expect(await screen.findByLabelText('Overdue Notifications')).not.toBeChecked();
  });

  it('updates user settings on save', async () => {
    // Mock the updateUser service to resolve (simulate successful update)
    updateUser.mockResolvedValueOnce();
  
    // Render the UserSettingsPage component
    render(<UserSettingsPage />);
  
    // Wrap all actions and assertions within a single act block
    await act(async () => {
      // Change the notification settings
      fireEvent.click(screen.getByLabelText('Overdue Notifications')); // Enable overdue notifications
  
      // Click the "Save Settings" button
      fireEvent.click(screen.getByText('Save'));
  
      // Wait for the promise to resolve (if updateUser returns a promise)
      await Promise.resolve(); 
  
      // Assert that updateUser was called with the expected data
      expect(updateUser).toHaveBeenCalledWith({
        notifications: {
          dueSoon: false, // Default value
          overdue: true,  // Updated value
        },
      });
    });
  });

  it('displays an error message if fetching user settings fails', async () => {
    // Mock the fetchUser service to throw an error
    const errorMessage = 'Failed to fetch user settings';
    fetchUser.mockRejectedValue(errorMessage);

    // Render the UserSettingsPage component
    render(<UserSettingsPage />);

    // Wait for the error message to appear
    const errorElement = await screen.findByText(errorMessage);

    // Assert that the error message is displayed
    expect(errorElement).toBeInTheDocument();
  });

  it('displays an error message if updating user settings fails', async () => {
    // Mock the updateUser service to throw an error
    const errorMessage = 'Failed to update user settings';
    updateUser.mockRejectedValue(errorMessage);

    // Render the UserSettingsPage component
    render(<UserSettingsPage />);

    act(() => {
        // Click the "Save Settings" button
        fireEvent.click(screen.getByText('Save'));
    });

    // Wait for the error message to appear
    const errorElement = await screen.findByText(errorMessage);

    // Assert that the error message is displayed
    expect(errorElement).toBeInTheDocument();
  });
});