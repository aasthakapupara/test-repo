import api from './api';

const studentService = {
    // My Attendance
    getMyAttendance: (params) => api.get('attendance/attendance-list', { params }), // Backend handles role 3 auto-filtering

    // My Results
    getMyResults: () => api.get('branch/student-result-list'),

    // Helper to get all tests (to map results to test names)
    getTests: () => api.get('branch/student-test-list'),
};

export default studentService;
