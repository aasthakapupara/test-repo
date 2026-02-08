import { useState, useCallback } from 'react';
import facultyService from '../services/facultyService';

export const useAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [attendanceData, setAttendanceData] = useState({});

    const markAttendanceCSV = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('csv', file);
        try {
            setLoading(true);
            const response = await facultyService.markAttendance(formData);
            setStatus({
                type: 'success',
                message: `Processed: ${response.data.content.inserted} added, ${response.data.content.skipped} skipped.`
            });
            return response.data.content;
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to upload CSV.' });
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const markAttendanceManual = useCallback(async (records) => {
        try {
            setLoading(true);
            const response = await facultyService.markAttendanceManual({ records });
            setStatus({
                type: 'success',
                message: `Successfully marked attendance for ${response.data.content.inserted} students.`
            });
            return response.data.content;
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to submit manual attendance.' });
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleStudent = useCallback((studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
        }));
    }, []);

    return {
        loading,
        status,
        setStatus,
        attendanceData,
        setAttendanceData,
        markAttendanceCSV,
        markAttendanceManual,
        toggleStudent
    };
};
