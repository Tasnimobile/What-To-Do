// src/components/WelcomePage/WelcomePage.js
import React from 'react';
import './WelcomePage.css';

const WelcomePage = ({ onSwitchToLogin, onSwitchToSignup, onSwitchToHomepage, onSwitchToAccountSetup }) => {
    return (
        <div className="welcome-page">
            <div className="welcome-container">
                <div className="welcome-header">
                    <h2 className="welcome-subtitle">Welcome to</h2>
                    <h1 className="welcome-title">What To Do</h1>
                    <p className="welcome-description">A community that wants to find and share fun new things to do</p>
                </div>

                <div className="welcome-buttons">
                    <button
                        className="welcome-button login-button"
                        onClick={onSwitchToLogin}
                    >
                        Log In
                    </button>

                    <button
                        className="welcome-button signup-button"
                        onClick={onSwitchToSignup}
                    >
                        Sign Up
                    </button>

                    {/* Temp Bypass Buttons */}
                    <button
                        className="welcome-button temp-bypass-button"
                        onClick={onSwitchToHomepage}
                    >
                        Go to Homepage
                    </button>

                    <button
                        className="welcome-button temp-bypass-button"
                        onClick={onSwitchToAccountSetup}
                    >
                        Go to Account Setup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;