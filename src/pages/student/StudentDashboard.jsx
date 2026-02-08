import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard, ClipboardCheck, FileBarChart, Download, User } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import UserProfile from '../../components/UserProfile';
import StudentAttendance from './StudentAttendance';
import StudentResults from './StudentResults';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';

import StudentOverview from './StudentOverview';

const StudentDashboard = () => {
    const studentNavItems = [
        { label: 'Overview', path: '/student', icon: LayoutDashboard },
        { label: 'My Attendance', path: '/student/attendance', icon: ClipboardCheck },
        { label: 'My Results', path: '/student/results', icon: FileBarChart },
        { label: 'My Profile', path: '/student/profile', icon: User },
    ];

    return (
        <DashboardLayout navItems={studentNavItems} title="Student Portal">
            <Routes>
                <Route index element={<StudentOverview />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="results" element={<StudentResults />} />
                <Route path="profile" element={<UserProfile />} />
            </Routes>
        </DashboardLayout>
    );
};

export default StudentDashboard;
