import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, UserCog, ClipboardCheck, FileBarChart, Download, BookOpen, GraduationCap, Upload } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import BranchManagement from './BranchManagement';
import ClassManagement from './ClassManagement';
import CourseManagement from './CourseManagement';
import SubjectManagement from './SubjectManagement';
import FacultyManagement from './FacultyManagement';
import AttendanceManagement from './AttendanceManagement';
import ResultsManagement from './ResultsManagement';
import ReportsManagement from './ReportsManagement';
import StudentManagement from './StudentManagement';
import AttendanceReports from './AttendanceReports';
import BulkResultUpload from './BulkResultUpload';

import AdminOverview from './AdminOverview';

const AdminDashboard = () => {
    const adminNavItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Branches', path: '/admin/branches', icon: Building2 },
        { label: 'Classes', path: '/admin/classes', icon: GraduationCap },
        { label: 'Courses', path: '/admin/courses', icon: BookOpen },
        { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
        { label: 'Students', path: '/admin/students', icon: Users },
        { label: 'Faculty', path: '/admin/faculty', icon: UserCog },
        { label: 'Attendance', path: '/admin/attendance', icon: ClipboardCheck },
        { label: 'Results', path: '/admin/results', icon: FileBarChart },
        { label: 'Reports', path: '/admin/reports', icon: Download },
        // { label: 'Attendance Reports', path: '/admin/attendance-reports', icon: FileBarChart },
        // { label: 'Bulk Results', path: '/admin/bulk-results', icon: Upload },
    ];

    return (
        <DashboardLayout navItems={adminNavItems} title="Admin Panel">
            <Routes>
                <Route index element={<AdminOverview />} />
                <Route path="branches" element={<BranchManagement />} />
                <Route path="classes" element={<ClassManagement />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="subjects" element={<SubjectManagement />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="faculty" element={<FacultyManagement />} />
                <Route path="attendance" element={<AttendanceManagement />} />
                <Route path="results" element={<ResultsManagement />} />
                <Route path="reports" element={<ReportsManagement />} />
                <Route path="attendance-reports" element={<AttendanceReports />} />
                <Route path="bulk-results" element={<BulkResultUpload />} />
            </Routes>
        </DashboardLayout>
    );
};

export default AdminDashboard;
