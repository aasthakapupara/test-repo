import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children, navItems, title = "Institute" }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        { id: 1, text: 'Welcome to the new dashboard!', time: '1h ago', read: false },
        { id: 2, text: 'Attendance report for Jan 2026 is ready.', time: '3h ago', read: false },
        { id: 3, text: 'Profile updated successfully.', time: '1d ago', read: true },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-box" style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8 }}></div>
                    <h2>{title}</h2>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <div className="user-profile">
                        <div style={{ position: 'relative' }}>
                            <button
                                className={`nav-item ${showNotifications ? 'active' : ''}`}
                                style={{ background: 'transparent', padding: '0.5rem', position: 'relative' }}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                <span style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    width: 8,
                                    height: 8,
                                    background: 'var(--error)',
                                    borderRadius: '50%',
                                    border: '2px solid var(--card-bg)'
                                }}></span>
                            </button>

                            {showNotifications && (
                                <div className="notifications-dropdown glass animate-slide">
                                    <div className="dropdown-header">
                                        <h3>Notifications</h3>
                                        <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                                    </div>
                                    <div className="dropdown-body">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`notification-item ${n.read ? 'read' : ''}`}>
                                                <p>{n.text}</p>
                                                <span>{n.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.firstname} {user?.lastname}</span>
                            <span className="user-role">
                                {user?.role === 1 ? 'Administrator' : user?.role === 2 ? 'Faculty' : 'Student'}
                            </span>
                        </div>
                        <div className="avatar" style={{ width: 40, height: 40, background: 'var(--border)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <User size={24} />
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
