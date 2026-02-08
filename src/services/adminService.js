import api from './api';

const adminService = {
    // Branch Management
    getBranches: () => api.get('branch/branch-list'),
    addBranch: (data) => api.post('admin/add-branch', data),
    editBranch: (id, data) => api.put(`admin/edit-branch/${id}`, data),
    deleteBranch: (id) => api.delete(`admin/delete-branch/${id}`),

    // Class Management
    getClasses: () => api.get('branch/class-list'),
    addClass: (data) => api.post('admin/add-class', data),
    editClass: (id, data) => api.put(`admin/edit-class/${id}`, data),
    deleteClass: (id) => api.delete(`admin/delete-class/${id}`),

    // Course Management
    getCourses: () => api.get('branch/course-list'),
    addCourse: (data) => api.post('admin/add-course', data),
    editCourse: (id, data) => api.put(`admin/edit-course/${id}`, data),
    deleteCourse: (id) => api.delete(`admin/delete-course/${id}`),

    // Subject Management
    getSubjects: () => api.get('branch/subject-list'),
    addSubject: (data) => api.post('admin/add-subject', data),
    editSubject: (id, data) => api.put(`admin/edit-subject/${id}`, data),
    deleteSubject: (id) => api.delete(`admin/delete-subject/${id}`),

    // User Management (Students & Faculty)
    getUsers: () => api.get('admin/user-list'),
    addUser: (data) => api.post('admin/add-user', data),
    editUser: (id, data) => api.put(`admin/edit-user/${id}`, data),
    deleteUser: (id) => api.delete(`admin/delete-user/${id}`),

    // Student Specific Assignments
    getStudentAssignments: () => api.get('admin/student-assignment-list'),
    assignStudent: (data) => api.post('admin/add-student-assignment', data),
    editStudentAssignment: (id, data) => api.put(`admin/edit-student-assignment/${id}`, data),
    bulkUploadStudents: (formData) => api.post('admin/bulk-upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Faculty Branch Allocation
    getFacultyAssignments: () => api.get('branch/faculty-list'),
    assignFacultyBranch: (data) => api.post('admin/add-faculty', data),
    editFacultyAssignment: (id, data) => api.put(`admin/edit-faculty/${id}`, data),
    deleteFacultyAssignment: (id) => api.delete(`admin/delete-faculty/${id}`),

    // Faculty Subject Allocation
    // Note: Use 'branch/faculty-subjects-list' or similar to fetch if needed
    assignFacultySubject: (data) => api.post('admin/add-faculty-subject', data),
    getFacultySubjectAssignments: () => api.get('branch/faculty-subjects-list'),
    editFacultySubject: (id, data) => api.put(`admin/edit-faculty-subject/${id}`, data),
    deleteFacultySubject: (id) => api.delete(`admin/delete-faculty-subject/${id}`),

    // Attendance Management
    getAttendance: (params) => api.get('attendance/attendance-list', { params }),
    uploadAttendance: (formData) => api.post('admin/add-attendance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    editAttendance: (id, data) => api.put(`admin/edit-attendance/${id}`, data),
    deleteAttendance: (id) => api.delete(`admin/delete-attendance/${id}`),

    // Results & Academic Records
    getResults: () => api.get('branch/student-result-list'),
    addResult: (formData) => api.post('admin/add-result', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    editResult: (id, formData) => api.put(`admin/edit-result/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteResult: (id) => api.delete(`admin/delete-result/${id}`),
    uploadBulkResults: (formData) => api.post('admin/bulk-upload-results', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Tests Management (needed for results)
    getTests: () => api.get('branch/student-test-list'),
    addTest: (data) => api.post('admin/add-test', data),
    editTest: (id, data) => api.put(`admin/edit-test/${id}`, data),
    deleteTest: (id) => api.delete(`admin/delete-test/${id}`),
};

export default adminService;
