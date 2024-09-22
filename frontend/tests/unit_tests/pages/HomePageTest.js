import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../../src/pages/HomePage';
import { AuthContext } from '../../../src/context/AuthContext';

// Mock the AuthContext to control the user state
const mockUser = null; // Initially, no user is logged in
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const MockAuthProvider = ({ children }) => (
  <AuthContext.Provider value={{ user: mockUser }}>
    {children}
  </AuthContext.Provider>
);

describe('HomePage', () => {
  it('renders the home page content when no user is logged in', () => {
    render(
      <BrowserRouter>
        <MockAuthProvider>
          <HomePage />
        </MockAuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome to Task Management App')).toBeInTheDocument();
    expect(screen.getByText('Please login or sign up to get started.')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('redirects to the dashboard if a user is logged in', () => {
    // Mock a logged-in user
    const mockLoggedInUser = { _id: '123', name: 'Logged In User' };
  
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: mockLoggedInUser }}>
          <HomePage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  
    // Assert that the navigation to /dashboard occurred
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });  
});