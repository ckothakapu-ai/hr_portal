import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from './AuthContext';
import HRPortal from './HRPortal';
import api from './api';

jest.mock('./api');

const mockUser = {
  is_hr: true,
};

const mockJobs = [
  { id: 1, title: 'Software Engineer', description: 'A great job.' },
];

const mockApplications = [
  { id: 1, candidate_id: 1, status: 'submitted' },
];

const renderWithContext = (component) => {
  return render(
    <AuthContext.Provider value={{ user: mockUser, logout: jest.fn() }}>
      <BrowserRouter>{component}</BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('HRPortal Component', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === '/hr/jobs/') {
        return Promise.resolve({ data: mockJobs });
      }
      if (url.includes('/applications')) {
        return Promise.resolve({ data: mockApplications });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  it('fetches and displays jobs', async () => {
    renderWithContext(<HRPortal />);
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  it('can open the create job dialog', async () => {
    renderWithContext(<HRPortal />);
    fireEvent.click(screen.getByText('Create New Job'));
    await waitFor(() => {
      expect(screen.getByText('Create New Job')).toBeInTheDocument();
    });
  });

  it('can view applications for a job', async () => {
    renderWithContext(<HRPortal />);
    await waitFor(() => {
        fireEvent.click(screen.getByText('View Applications'));
      });
    await waitFor(() => {
      expect(screen.getByText('Applications for Job #1')).toBeInTheDocument();
      expect(screen.getByText('Application from Candidate ID: 1')).toBeInTheDocument();
    });
  });
});