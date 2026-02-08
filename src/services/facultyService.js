import api from './api';

const facultyService = {
    // My Assignments (Branches/Subjects)
    getMyAssignments: () => api.get('branch/faculty-subjects-list'),

    // All branches
    getBranches: () => api.get('branch/branch-list'),

    // Students in my branches
    // Fetch all student-branch assignments to map them
    getStudentAssignments: () => api.get('branch/student-list'), // Assumed endpoint

    // All users (to get student names)
    getUsers: () => api.get('admin/user-list'),

    // Attendance Operations
    markAttendance: (data) => api.post('admin/add-attendance', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    markAttendanceManual: (data) => api.post('admin/manual-add', data),
    getAttendance: (params) => api.get('attendance/attendance-list', { params }),
    editAttendance: (id, data) => api.put(`admin/edit-attendance/${id}`, data),

    // Results Operations
    uploadResults: (formData) => api.post('admin/add-result', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getTests: () => api.get('branch/student-test-list'),
};

export default facultyService;
