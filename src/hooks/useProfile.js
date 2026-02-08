import { useState, useCallback } from 'react';
import userService from '../services/userService';

export const useProfile = (user) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [passwordStatus, setPasswordStatus] = useState(null);

    const updateProfile = useCallback(async (profileData) => {
        try {
            setLoading(true);
            await userService.updateProfile(user.id, profileData);
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update profile.'
            });
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    const changePassword = useCallback(async (passwordData) => {
        try {
            setLoading(true);
            await userService.changePassword(passwordData);
            setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
        } catch (error) {
            setPasswordStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update password.'
            });
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        status,
        setStatus,
        passwordStatus,
        setPasswordStatus,
        updateProfile,
        changePassword
    };
};
