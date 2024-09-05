// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Landing from './pages/landing';
import About from './pages/about';
import Registration from './pages/registration';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Features from './pages/features';
import FeaturesLanding from './pages/featuresLanding';
import Chatbot from './pages/chatbot';
import ChatbotHistory from './pages/chatbotHistory';
import Interview from './pages/interview';
import Profile from './pages/profile';
import EditProfile from './pages/editProfile';
import Verif from './pages/verif';
import History from './pages/history';
import ForgotPassword from './pages/forgotPassword';
import Summary from './pages/summary';
import LoginRequired from './pages/loginRequired';
import Pricing from './pages/pricing';
import SessionSummary from './pages/sessionSummary';
import withAuth from './components/withAuth'; // Import the withAuth HOC

// Wrap protected components with HOC here
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedFeatures = withAuth(Features);
const ProtectedFeaturesLanding = withAuth(FeaturesLanding);
const ProtectedChatbot = withAuth(Chatbot);
const ProtectedChatbotHistory = withAuth(ChatbotHistory);
const ProtectedInterview = withAuth(Interview);
const ProtectedProfile = withAuth(Profile);
const ProtectedEditProfile = withAuth(EditProfile);
const ProtectedVerif = withAuth(Verif);
const ProtectedHistory = withAuth(History);
const ProtectedSummary = withAuth(Summary);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <div className="App">
      <Router>
        {/* <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} /> */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/summary/:uniqueId" element={<SessionSummary />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedDashboard />} />
          <Route path="/features" element={<ProtectedFeatures />} />
          <Route path="/featuresLanding" element={<ProtectedFeaturesLanding />} />
          <Route path="/chatbot" element={<ProtectedChatbot />} />
          <Route path="/chatbotHistory" element={<ProtectedChatbotHistory />} />
          <Route path="/interview" element={<ProtectedInterview />} />
          <Route path="/profile" element={<ProtectedProfile />} />
          <Route path="/editProfile" element={<ProtectedEditProfile />} />
          <Route path="/verif" element={<ProtectedVerif />} />
          <Route path="/history" element={<ProtectedHistory />} />
          <Route path="/summary" element={<ProtectedSummary />} />
          <Route path="/summary/:id" element={<ProtectedSummary />} />
          <Route path="/interview/:code" element={<ProtectedInterview />} />

          
          {/* Login Required Page */}
          <Route path="/login-required" element={<LoginRequired />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
