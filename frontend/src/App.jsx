import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import Analytics from './pages/Analytics';
import EmergencyCall from './pages/EmergencyCall';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? (
    <>
      <Navbar />
      <div className="container page-transition">{children}</div>
      <Chatbot />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/symptom-checker" element={<PrivateRoute><SymptomChecker /></PrivateRoute>} />
        <Route path="/prediction" element={<PrivateRoute><PredictionResult /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/emergency" element={<PrivateRoute><EmergencyCall /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
