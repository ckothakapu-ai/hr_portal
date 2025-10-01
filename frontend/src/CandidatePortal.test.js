import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from './AuthContext';
import CandidatePortal from './CandidatePortal';
import api from './api';

jest.mock('./api');

const mockUser = {
  is_hr: false,
};

const mockJobs = [
  { id: 1, title: 'Software Engineer', description: 'A great job.' },
  { id: 2, title: 'Product Manager', description: 'Another great job.' },
];

const renderWithContext = (component) => {
  return render(
    <AuthContext.Provider value={{ user: mockUser, logout: jest.fn() }}>
      <BrowserRouter>{component}</BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('CandidatePortal Component', () => {
  it('fetches and displays jobs', async () => {
    api.get.mockResolvedValue({ data: mockJobs });
    renderWithContext(<CandidatePortal />);

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Product Manager')).toBeInTheDocument();
    });
  });

  it('shows apply and upload buttons', () => {
    api.get.mockResolvedValue({ data: mockJobs });
    renderWithContext(<CandidatePortal />);

    expect(screen.getAllByText('Apply')[0]).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });
});