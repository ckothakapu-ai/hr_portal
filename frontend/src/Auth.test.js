import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from './AuthContext';
import Auth from './Auth';

const mockLogin = jest.fn();
const mockRegister = jest.fn();

const renderWithContext = (component) => {
  return render(
    <AuthContext.Provider value={{ login: mockLogin, register: mockRegister }}>
      <BrowserRouter>{component}</BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Auth Component', () => {
  it('renders the login form by default', () => {
    renderWithContext(<Auth />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('switches to the registration form', () => {
    renderWithContext(<Auth />);
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('calls the login function on form submission', async () => {
    renderWithContext(<Auth />);
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  it('calls the register function on form submission', async () => {
    renderWithContext(<Auth />);
    fireEvent.click(screen.getByText('Sign Up')); // Switch to register form
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });
});