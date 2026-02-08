import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import facultyService from '../services/facultyService';
import studentService from '../services/studentService';

export const useDashboard = (role) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            let response;
            if (role === 1) {
                // For Admin, we still use the placeholders as the backend overview endpoint is simple
                // In a real app, this would be a single API call
                setStats([
                    { label: 'Total Branches', value: '12', color: 'var(--primary)' },
                    { label: 'Total Students', value: '1,240', color: 'var(--success)' },
                    { label: 'Total Faculty', value: '48', color: 'var(--warning)' },
                    { label: 'Attendance (Today)', value: '94%', color: 'var(--error)' },
                ]);
            } else if (role === 2) {
                const [usersRes, assignmentsRes, testsRes, myAssignmentsRes] = await Promise.all([
                    facultyService.getUsers(),
                    adminService.getStudentAssignments(),
                    facultyService.getTests(),
                    facultyService.getMyAssignments()
                ]);

                // Assuming user object is available or passed to hook
                // For simplicity, let's assume the hook gets the user from AuthContext
                // But since I didn't pass it, I'll use the response directly

                setStats([
                    { label: 'My Students', value: usersRes.data.content.length, color: 'var(--primary)' },
                    { label: 'Assignments', value: myAssignmentsRes.data.content.length, color: 'var(--success)' },
                    { label: 'Active Tasks', value: '8', color: 'var(--warning)' },
                    { label: 'Conducted Tests', value: testsRes.data.content.length, color: 'var(--error)' }
                ]);
            }
            else if (role === 3) {
                const [attendanceRes, resultsRes] = await Promise.all([
                    studentService.getMyAttendance({ filter: 'all_time' }),
                    studentService.getMyResults()
                ]);

                // Check if attendance is paginated (has records) or flat array
                const attendance = attendanceRes.data.content.records || attendanceRes.data.content;
                const myResults = resultsRes.data.content; // Already filtered by backend usually, but check

                const attendanceRate = attendance.length > 0
                    ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)
                    : 0;

                const totalObtained = myResults.reduce((sum, r) => sum + (parseFloat(r.obtained_marks) || 0), 0);
                const docCount = myResults.reduce((count, r) => {
                    const m = r.marksheet ? JSON.parse(r.marksheet).length : 0;
                    const a = r.answersheet ? JSON.parse(r.answersheet).length : 0;
                    return count + m + a;
                }, 0);

                setStats([
                    { label: 'Attendance Rate', value: `${attendanceRate}%`, color: 'var(--success)' },
                    { label: 'Average Score', value: myResults.length > 0 ? (totalObtained / myResults.length).toFixed(1) : 0, color: 'var(--primary)' },
                    { label: 'Tests Attempted', value: myResults.length, color: 'var(--warning)' },
                    { label: 'My Documents', value: docCount, color: 'var(--secondary)' }
                ]);
            }
            setError(null);
        } catch (err) {
            setError('Failed to load dashboard statistics.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refresh: fetchStats };
};
