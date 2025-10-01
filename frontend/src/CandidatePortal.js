import React, { useState, useEffect, useContext } from 'react';
import api from './api';
import AuthContext from './AuthContext';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  TextField,
} from '@mui/material';

const CandidatePortal = () => {
  const [jobs, setJobs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    // Fetch jobs
    api.get('/candidate/jobs/').then((response) => {
      setJobs(response.data);
    });
  }, []);

  const handleApply = (jobId) => {
    api.post(`/candidate/jobs/${jobId}/apply`)
      .then(() => {
        alert('Application submitted successfully!');
      })
      .catch((error) => {
        console.error('Failed to apply:', error);
        alert('Failed to submit application.');
      });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    api.post('/candidate/documents/upload', formData)
      .then(() => {
        alert('Document uploaded successfully!');
        // Refresh documents list
      })
      .catch((error) => {
        console.error('Failed to upload document:', error);
        alert('Failed to upload document.');
      });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Typography variant="h4">Candidate Portal</Typography>
        <Button variant="contained" onClick={logout}>Logout</Button>
      </Box>

      <Typography variant="h5" sx={{ mt: 4 }}>Available Jobs</Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{job.title}</Typography>
                <Typography>{job.description}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleApply(job.id)}>Apply</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mt: 4 }}>My Documents</Typography>
      <Box sx={{ mt: 2 }}>
        <TextField type="file" onChange={handleFileChange} />
        <Button onClick={handleUpload} variant="contained" sx={{ ml: 2 }}>Upload</Button>
      </Box>
    </Container>
  );
};

export default CandidatePortal;