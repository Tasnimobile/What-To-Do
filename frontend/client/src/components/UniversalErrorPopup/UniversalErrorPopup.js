// src/components/UniversalErrorPopup/UniversalErrorPopup.js
import React, { useState, useEffect } from 'react';
import './UniversalErrorPopup.css';

const UniversalErrorPopup = ({
    message,
    onClose,
    duration = 5000,
    showCloseButton = true
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (message) {
            setIsVisible(true);

            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    if (!message || !isVisible) return null;

    return (
        <div className={`universal-error-popup ${!isVisible ? 'fade-out' : ''}`}>
            <div className="universal-popup-content">
                {showCloseButton && (
                    <button
                        className="universal-popup-close"
                        onClick={handleClose}
                        aria-label="Close error message"
                    >
                        ×
                    </button>
                )}
                <p className="universal-popup-message">{message}</p>
            </div>
        </div>
    );
};

export default UniversalErrorPopup;