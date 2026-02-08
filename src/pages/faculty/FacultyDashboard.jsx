import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, FileBarChart, User, History } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import FacultyStudentList from './FacultyStudentList';
import AttendanceEntry from './AttendanceEntry';
import ResultsUpload from './ResultsUpload';
import AttendanceHistory from './AttendanceHistory';
import UserProfile from '../../components/UserProfile';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import adminService from '../../services/adminService';

import FacultyOverview from './FacultyOverview';

const FacultyDashboard = () => {
    const facultyNavItems = [
        { label: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
        { label: 'My Students', path: '/faculty/students', icon: Users },
        { label: 'Mark Attendance', path: '/faculty/attendance', icon: ClipboardCheck },
        { label: 'Attendance History', path: '/faculty/attendance-history', icon: History },
        { label: 'Post Results', path: '/faculty/results', icon: FileBarChart },
        { label: 'My Profile', path: '/faculty/profile', icon: User },
    ];

    return (
        <DashboardLayout navItems={facultyNavItems} title="Faculty Portal">
            <Routes>
                <Route index element={<FacultyOverview />} />
                <Route path="students" element={<FacultyStudentList />} />
                <Route path="attendance" element={<AttendanceEntry />} />
                <Route path="attendance-history" element={<AttendanceHistory />} />
                <Route path="results" element={<ResultsUpload />} />
                <Route path="profile" element={<UserProfile />} />
            </Routes>
        </DashboardLayout>
    );
};

export default FacultyDashboard;
