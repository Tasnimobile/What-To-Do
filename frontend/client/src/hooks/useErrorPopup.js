// src/hooks/useErrorPopup.js
import { useState, useCallback } from 'react';

export const useErrorPopup = () => {
    const [error, setError] = useState('');

    const showError = useCallback((errorMessage) => {
        setError(errorMessage);
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