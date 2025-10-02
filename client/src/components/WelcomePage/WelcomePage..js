// src/components/WelcomePage/WelcomePage.js
import React from 'react';
import './WelcomePage.css';

const WelcomePage = ({ onSwitchToLogin, onSwitchToSignup }) => {
    return (
        <div className="welcome-page">
            <div className="welcome-container">
                <div className="welcome-header">
                    <h1>Welcome!</h1>
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
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;