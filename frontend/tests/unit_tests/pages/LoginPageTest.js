import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../../../src/pages/LoginPage';
import { AuthContext } from '../../../src/context/AuthContext';
import AppBackendApi from '../../../src/apis/BackendApi';

// Mock the AuthContext to control the login function and user state
const mockLogin = jest.fn();
const mockUser = null; // Initially, no user is logged in
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the Backend API
jest.mock('../../../src/apis/BackendApi');

const MockAuthProvider = ({ children }) => (
  <AuthContext.Provider value={{ user: mockUser, login: mockLogin }}>
    {children}
  </AuthContext.Provider>
);

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockLogin.mockReset();
    mockNavigate.mockReset();
    // Mock the CSRF token fetch
    AppBackendApi.get.mockResolvedValue({ data: { csrfToken: 'mock-csrf-token' } });   
  });

  it('navigates to the dashboard if login is successful', async () => {
    // Mock the login function to resolve (simulate successful login)
    mockLogin.mockResolvedValueOnce();

    // Render the LoginPage within a BrowserRouter and MockAuthProvider
    render(
      <BrowserRouter>
        <MockAuthProvider>
          <LoginPage />
        </MockAuthProvider>
      </BrowserRouter>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByText('Login'));
    await act(() => Promise.resolve()); // Use act() to wrap asynchronous operations

    // Assert that the login function was called with the correct arguments
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');

    // Assert that the navigation to /dashboard occurred
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('displays an error message if login fails', async () => {
    // Mock the login function to reject (simulate failed login)
    const errorMessage = 'Login failed';
    mockLogin.mockRejectedValueOnce(errorMessage);

    render(
      <BrowserRouter>
        <MockAuthProvider>
          <LoginPage />
        </MockAuthProvider>
      </BrowserRouter>
    );

    // Fill in the form fields (any values will do)
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByText('Login'));

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
        <AuthContext.Provider value={{ user: mockLoggedInUser, login: mockLogin }}>
          <LoginPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await act(() => Promise.resolve());

    // Assert that the navigation to /dashboard occurred
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});