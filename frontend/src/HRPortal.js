import React, { useState, useEffect, useContext } from 'react';
import api from './api';
import AuthContext from './AuthContext';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
} from '@mui/material';

const HRPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openCreateJob, setOpenCreateJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '' });
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    api.get('/hr/jobs/').then((response) => {
      setJobs(response.data);
    });
  };

  const handleCreateJob = () => {
    api.post('/hr/jobs/', newJob)
      .then(() => {
        fetchJobs();
        setOpenCreateJob(false);
        setNewJob({ title: '', description: '' });
      })
      .catch((error) => {
        console.error('Failed to create job:', error);
        alert('Failed to create job.');
      });
  };

  const handleViewApplications = (jobId) => {
    api.get(`/hr/jobs/${jobId}/applications`).then((response) => {
      setApplications(response.data);
      setSelectedJob(jobId);
    });
  };

  const handleUpdateStatus = (appId, status) => {
    api.put(`/hr/applications/${appId}`, { status }).then(() => {
      // Refresh applications for the selected job
      handleViewApplications(selectedJob);
    });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Typography variant="h4">HR Portal</Typography>
        <Button variant="contained" onClick={logout}>Logout</Button>
      </Box>

      <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenCreateJob(true)}>
        Create New Job
      </Button>

      <Typography variant="h5" sx={{ mt: 4 }}>Job Listings</Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{job.title}</Typography>
                <Typography>{job.description}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleViewApplications(job.id)}>
                  View Applications
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedJob && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Applications for Job #{selectedJob}</Typography>
          <List>
            {applications.map((app) => (
              <ListItem key={app.id}>
                <ListItemText primary={`Application from Candidate ID: ${app.candidate_id}`} />
                <Select
                  value={app.status}
                  onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                >
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                </Select>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Dialog open={openCreateJob} onClose={() => setOpenCreateJob(false)}>
        <DialogTitle>Create New Job</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Job Title"
            fullWidth
            value={newJob.title}
            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Job Description"
            fullWidth
            multiline
            rows={4}
            value={newJob.description}
            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateJob(false)}>Cancel</Button>
          <Button onClick={handleCreateJob}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HRPortal;