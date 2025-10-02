// src/App.js
import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import WelcomePage from './components/WelcomePage/WelcomePage..js';
import LoginPage from './components/LoginPage/LoginPage';
import SignupPage from './components/SignupPage/SignupPage';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [pageHistory, setPageHistory] = useState(['welcome']); // Track navigation history
  const [user, setUser] = useState(null);

  const navigateTo = (page) => {
    setPageHistory(prev => [...prev, page]);
    setCurrentPage(page);
  };

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    console.log('User logged in:', userData);
  };

  const handleSignup = (userData) => {
    setUser(userData);
    console.log('User signed up:', userData);
  };

  const handleGoogleLogin = (googleData) => {
    console.log('Google login successful:', googleData);
    const userObject = parseJwt(googleData.credential);
    const userData = {
      id: userObject.sub,
      name: userObject.name,
      email: userObject.email,
      picture: userObject.picture,
      provider: 'google'
    };
    setUser(userData);
    console.log('User data:', userData);
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const switchToSignup = () => {
    navigateTo('signup');
  };

  const switchToLogin = () => {
    navigateTo('login');
  };

  const switchToWelcome = () => {
    navigateTo('welcome');
  };

  // Render the appropriate page based on current state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={switchToSignup}
            onBack={handleBack}
            onGoogleLogin={handleGoogleLogin}
          />
        );
      case 'signup':
        return (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={switchToLogin}
            onBack={handleBack}
            onGoogleLogin={handleGoogleLogin}
          />
        );
      case 'welcome':
      default:
        return (
          <WelcomePage
            onSwitchToLogin={switchToLogin}
            onSwitchToSignup={switchToSignup}
          />
        );
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}>
      <div className="app">
        {renderCurrentPage()}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;