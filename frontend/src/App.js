import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AuthContext from './AuthContext';
import Auth from './Auth';
import CandidatePortal from './CandidatePortal';
import HRPortal from './HRPortal';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            user ? (
              user.is_hr ? (
                <HRPortal />
              ) : (
                <CandidatePortal />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;