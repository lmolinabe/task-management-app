import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from '../../../src/pages/SignupPage';
import { AuthContext } from '../../../src/context/AuthContext';

// Mock the AuthContext to control the signup function and user state
const mockSignup = jest.fn();
const mockUser = null; // Initially, no user is logged in
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const MockAuthProvider = ({ children }) => (
  <AuthContext.Provider value={{ user: mockUser, signup: mockSignup }}>
    {children}
  </AuthContext.Provider>
);

describe('SignupPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSignup.mockReset();
    mockNavigate.mockReset();
  });

  it('navigates to the login page if signup is successful', async () => {
    // Mock the signup function to resolve (simulate successful signup)
    mockSignup.mockResolvedValueOnce();

    // Render the SignupPage within a BrowserRouter and MockAuthProvider
    render(
      <BrowserRouter>
        <MockAuthProvider>
          <SignupPage />
        </MockAuthProvider>
      </BrowserRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByText('Sign Up'));
    await act(() => Promise.resolve()); // Use act() to wrap asynchronous operations

    // Assert that the signup function was called with the correct arguments
    expect(mockSignup).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');

    // Assert that the navigation to /login occurred
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays an error message if signup fails', async () => {
    // Mock the signup function to reject (simulate failed signup)
    const errorMessage = 'Signup failed';
    mockSignup.mockRejectedValueOnce(errorMessage);

    render(
      <BrowserRouter>
        <MockAuthProvider>
          <SignupPage />
        </MockAuthProvider>
      </BrowserRouter>
    );

    // Fill in the form fields (any values will do)
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByText('Sign Up'));

    // Check if the error message div exists
    let errorMessageDiv = await screen.findByText(errorMessage);

    // Assert that the error message div is present
    expect(errorMessageDiv).toBeInTheDocument(); 
  });

  it('redirects to the dashboard if a user is already logged in', async () => {
    // Mock a logged-in user
    const mockLoggedInUser = { _id: '123', name: 'Logged In User' };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: mockLoggedInUser, signup: mockSignup }}>
          <SignupPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Assert that the navigation to /dashboard occurred
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});