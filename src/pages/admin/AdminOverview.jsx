import { Building2, Users, UserCog, ClipboardCheck } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

const AdminOverview = () => {
    const { stats, loading, error } = useDashboard(1);

    if (loading) return <div className="loading-spinner">Loading Overview...</div>;
    if (error) return <div className="alert alert-error">{error}</div>;

    const icons = {
        'Total Branches': <Building2 />,
        'Total Students': <Users />,
        'Total Faculty': <UserCog />,
        'Attendance (Today)': <ClipboardCheck />
    };

    return (
        <div className="management-page animate-fade-in">
            <div className="page-header">
                <div className="header-content">
                    <h1>Dashboard Overview</h1>
                    <p>Welcome to the institute management portal.</p>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card" style={{ '--accent-color': stat.color, animationDelay: `${i * 0.1}s` }}>
                        <div className="stat-icon">{icons[stat.label]}</div>
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

export default AdminOverview;
