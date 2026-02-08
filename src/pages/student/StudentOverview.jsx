import { useState, useEffect } from 'react';
import { ClipboardCheck, FileBarChart, LayoutDashboard, Download, BookOpen, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import adminService from '../../services/adminService';

const StudentOverview = () => {
    const { user } = useAuth();
    const { stats, loading: statsLoading, error: statsError } = useDashboard(3);
    const [academicInfo, setAcademicInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAcademicInfo = async () => {
            try {
                const [assignmentsRes, branchesRes, classesRes] = await Promise.all([
                    adminService.getStudentAssignments(),
                    adminService.getBranches(),
                    adminService.getClasses()
                ]);

                const myAssignment = assignmentsRes.data.content.find(a => a.student_id === user.id);
                if (myAssignment) {
                    const branch = branchesRes.data.content.find(b => b.id === myAssignment.branch_id);
                    const className = classesRes.data.content.find(c => c.id === myAssignment.class_id);
                    setAcademicInfo({
                        branch_name: branch?.branch_name || 'N/A',
                        class_name: className?.class_name || 'N/A'
                    });
                }
            } catch (err) {
                console.error("Error fetching academic info:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAcademicInfo();
    }, [user.id]);

    if (statsLoading || loading) return <div className="loading-spinner">Loading Overview...</div>;
    if (statsError) return <div className="alert alert-error">{statsError}</div>;

    const icons = {
        'Attendance Rate': <ClipboardCheck />,
        'Average Score': <FileBarChart />,
        'Tests Attempted': <LayoutDashboard />,
        'My Documents': <Download />
    };

    return (
        <div className="management-page animate-fade-in">
            <div className="page-header">
                <div className="header-content">
                    <h1>Student Portal Overview</h1>
                    <p>Hello, {user.firstname}! Here's a summary of your academic journey.</p>
                </div>
            </div>

            {academicInfo && (
                <div className="academic-highlight-bar" style={{ display: 'flex', gap: '2rem', background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building2 size={20} className="text-primary" />
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Assigned Branch</span>
                            <span style={{ fontWeight: 600 }}>{academicInfo.branch_name}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={20} className="text-secondary" />
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Enrolled Class</span>
                            <span style={{ fontWeight: 600 }}>{academicInfo.class_name}</span>
                        </div>
                    </div>
                </div>
            )}

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

export default StudentOverview;
