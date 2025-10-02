// src/App.js
import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import LoginPage from './components/LoginPage/LoginPage';
import SignupPage from './components/SignupPage/SignupPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    console.log('User logged in:', userData);
    // We'll add navigation to dashboard later
  };

  const handleSignup = (userData) => {
    setUser(userData);
    console.log('User signed up:', userData);
    // We'll add navigation to dashboard later
  };

  const handleGoogleLogin = (googleData) => {
    console.log('Google login successful:', googleData);
    // Extract user info from Google response
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
    // Navigate to dashboard later
  };

  // Helper function to decode JWT
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const switchToSignup = () => {
    setCurrentPage('signup');
  };

  const switchToLogin = () => {
    setCurrentPage('login');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}>
      <div className="app">
        {currentPage === 'login' ? (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={switchToSignup}
            onGoogleLogin={handleGoogleLogin}
          />
        ) : (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={switchToLogin}
            onGoogleLogin={handleGoogleLogin}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;