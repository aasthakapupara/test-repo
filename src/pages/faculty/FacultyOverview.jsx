import { Users, LayoutDashboard, ClipboardCheck, FileBarChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';

const FacultyOverview = () => {
    const { user } = useAuth();
    const { stats, loading, error } = useDashboard(2);

    if (loading) return <div className="loading-spinner">Loading Overview...</div>;
    if (error) return <div className="alert alert-error">{error}</div>;

    const icons = {
        'My Students': <Users />,
        'Assignments': <LayoutDashboard />,
        'Active Tasks': <ClipboardCheck />,
        'Conducted Tests': <FileBarChart />
    };

    return (
        <div className="management-page animate-fade-in">
            <div className="page-header">
                <div className="header-content">
                    <h1>Faculty Dashboard Overview</h1>
                    <p>Welcome back, Prof. {user.firstname}! Here's what's happening today.</p>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card" style={{ '--accent-color': stat.color, animationDelay: `${i * 0.1}s` }}>
                        <div className="stat-icon">{icons[stat.label] || <LayoutDashboard />}</div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FacultyOverview;
