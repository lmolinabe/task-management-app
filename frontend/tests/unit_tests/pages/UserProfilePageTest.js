import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfilePage from '../../../src/pages/UserProfilePage';
import { fetchUser } from '../../../src/services/UserService';

// Mock the fetchUser service
jest.mock('../../../src/services/UserService');

describe('UserProfilePage', () => {
  it('renders user profile data', async () => {
    // Mock user data
    const mockUserData = {
      name: 'Test User',
      email: 'test@example.com',
    };

    // Mock the fetchUser service to return the mock data
    fetchUser.mockResolvedValue(mockUserData);

    // Render the UserProfilePage component
    render(<UserProfilePage />);

    // Assert that the user profile elements are rendered with the correct data
    expect(await screen.findByText('User Profile')).toBeInTheDocument();
    expect(await screen.findByText('Profile Information')).toBeInTheDocument();
    expect(await screen.findByText('Name:')).toBeInTheDocument();
    expect(await screen.findByText(mockUserData.name)).toBeInTheDocument();
    expect(await screen.findByText('Email:')).toBeInTheDocument();
    expect(await screen.findByText(mockUserData.email)).toBeInTheDocument();
  });

  it('displays an error message if fetching user data fails', async () => {
    // Mock the fetchUser service to throw an error
    const errorMessage = 'Failed to fetch user profile';
    fetchUser.mockRejectedValue(errorMessage);

    // Render the UserProfilePage component
    render(<UserProfilePage />);

    // Wait for the error message to appear
    const errorElement = await screen.findByText(errorMessage);

    // Assert that the error message is displayed
    expect(errorElement).toBeInTheDocument();
  });
});
