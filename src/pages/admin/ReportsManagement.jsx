import { useState } from 'react';
import { Download, FileText, PieChart, BarChart3, Calendar, AlertCircle } from 'lucide-react';

const ReportsManagement = () => {
    const [reportType, setReportType] = useState('attendance');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const handleExport = (format) => {
        alert(`Exporting ${reportType} report as ${format}...`);
        // Logic for triggering download would go here
    };

    const reportCards = [
        {
            title: 'Attendance Summary',
            description: 'Get daily, weekly or monthly attendance statistics for all branches.',
            icon: PieChart,
            type: 'attendance'
        },
        {
            title: 'Academic Performance',
            description: 'Analyze student test results and overall class performance trends.',
            icon: BarChart3,
            type: 'performance'
        },
        {
            title: 'Staff Allocation',
            description: 'View branch-wise faculty distribution and subject coverage report.',
            icon: FileText,
            type: 'staff'
        }
    ];

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Reports & Analytics</h1>
                    <p>Generate and export institute management data</p>
                </div>
            </div>

            <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.50rem', marginTop: '2rem' }}>
                {reportCards.map((report, index) => (
                    <div
                        key={index}
                        className={`report-card ${reportType === report.type ? 'active' : ''}`}
                        onClick={() => setReportType(report.type)}
                        style={{
                            background: 'var(--card-bg)',
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            border: reportType === report.type ? '2px solid var(--primary)' : '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                                <report.icon size={24} />
                            </div>
                            <h3 style={{ fontWeight: 600 }}>{report.title}</h3>
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', lineHeight: 1.5 }}>{report.description}</p>
                    </div>
                ))}
            </div>

            <div className="content-card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h2>Generate Report</h2>
                </div>
                <div className="report-config" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Report Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Report End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => handleExport('PDF')}>
                            <Download size={20} />
                            Export as PDF
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleExport('CSV')}>
                            <Download size={20} />
                            Export as CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsManagement;
