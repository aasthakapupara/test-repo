import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import { USER_ROLES } from './utils/constants';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<div style={{ padding: '2rem' }}><h1>Unauthorized Access</h1></div>} />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Protected Routes - Faculty */}
          <Route
            path="/faculty/*"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.FACULTY]}>
                <FacultyDashboard />
              </PrivateRoute>
            }
          />

          {/* Protected Routes - Student */}
          <Route
            path="/student/*"
            element={
              <PrivateRoute allowedRoles={[USER_ROLES.STUDENT]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<div style={{ padding: '2rem' }}><h1>404 - Not Found</h1></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
