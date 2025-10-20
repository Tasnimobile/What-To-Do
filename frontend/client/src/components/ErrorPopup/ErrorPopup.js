// src/components/ErrorPopup/ErrorPopup.js
import React, { useEffect, useState } from 'react';
import './ErrorPopup.css';

const ErrorPopup = ({ error, onClose, type = 'success' }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (error) {
            setIsVisible(true);

            const fadeOutTimer = setTimeout(() => {
                setIsVisible(false);
            }, 2700);
            const closeTimer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(closeTimer);
            };
        }
    }, [error, onClose]);

    if (!error) return null;

    return (
        <div className={`error-popup ${type} ${!isVisible ? 'fade-out' : ''}`}>
            {error}
        </div>
    );
};

export default ErrorPopup;