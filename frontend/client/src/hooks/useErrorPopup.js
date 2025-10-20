// src/hooks/useErrorPopup.js
import { useState, useCallback, useEffect } from 'react';

export const useErrorPopup = () => {
    const [error, setError] = useState('');

    const showError = useCallback((errorMessage, duration = 3000) => {
        setError(errorMessage);

        // Auto-clear after duration
        if (duration > 0) {
            setTimeout(() => {
                setError('');
            }, duration);
        }
    }, []);

    const clearError = useCallback(() => {
        setError('');
    }, []);

    return {
        error,
        showError,
        clearError
    };
};