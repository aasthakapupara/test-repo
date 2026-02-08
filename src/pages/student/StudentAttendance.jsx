import { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Calendar, Filter, Search, TrendingUp, BarChart3 } from 'lucide-react';
import studentService from '../../services/studentService';
import DataTable from '../../components/common/DataTable';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('this_month');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'monthly'

    useEffect(() => {
        fetchAttendance();
    }, [filter]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const response = await studentService.getMyAttendance({ filter });
            setAttendance(response.data.content.records || []);
        } catch (error) {
            console.error('Error fetching student attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate monthly breakdown
    const monthlyBreakdown = useMemo(() => {
        const breakdown = {};

        attendance.forEach(record => {
            if (!record.date) return;

            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            if (!breakdown[monthKey]) {
                breakdown[monthKey] = {
                    monthName,
                    total: 0,
                    present: 0,
                    absent: 0
                };
            }

            breakdown[monthKey].total++;
            if (record.status === 'present') {
                breakdown[monthKey].present++;
            } else {
                breakdown[monthKey].absent++;
            }
        });

        // Convert to array and sort by month (newest first)
        return Object.entries(breakdown)
            .map(([key, data]) => ({
                key,
                ...data,
                percentage: ((data.present / data.total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.key.localeCompare(a.key));
    }, [attendance]);

    const columns = [
        {
            accessor: 'date',
            header: 'Date',
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} className="text-dim" />
                    {new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            )
        },
        {
            accessor: 'status',
            header: 'Status',
            render: (val) => (
                <span className={`badge ${val === 'present' ? 'badge-success' : 'badge-error'}`}>
                    {val.toUpperCase()}
                </span>
            )
        }
    ];

    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
    };
    const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0.0';

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>My Attendance</h1>
                    <p>Track your presence across all classes</p>
                </div>
            </div>

            {/* Overall Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="content-card" style={{ textAlign: 'center' }}>
                    <h3 className="text-dim" style={{ fontSize: '0.875rem' }}>Attendance Rate</h3>
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{percentage}%</h2>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        marginTop: '1rem',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: parseFloat(percentage) >= 75 ? 'var(--success)' : parseFloat(percentage) >= 50 ? 'var(--warning)' : 'var(--error)',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
                <div className="content-card" style={{ textAlign: 'center' }}>
                    <h3 className="text-dim" style={{ fontSize: '0.875rem' }}>Days Present</h3>
                    <h2 style={{ fontSize: '2rem', color: 'var(--success)', marginTop: '0.5rem' }}>{stats.present}</h2>
                    <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        out of {stats.total} total days
                    </p>
                </div>
                <div className="content-card" style={{ textAlign: 'center' }}>
                    <h3 className="text-dim" style={{ fontSize: '0.875rem' }}>Days Absent</h3>
                    <h2 style={{ fontSize: '2rem', color: 'var(--error)', marginTop: '0.5rem' }}>{stats.absent}</h2>
                    <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        {stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : '0'}% absence rate
                    </p>
                </div>
            </div>

            <div className="content-card">
                {/* View Mode Toggle and Filter */}
                <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <Calendar size={16} />
                            Daily View
                        </button>
                        <button
                            className={`btn ${viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('monthly')}
                        >
                            <BarChart3 size={16} />
                            Monthly Breakdown
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Filter size={20} className="text-dim" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ minWidth: '180px' }}
                        >
                            <option value="this_month">This Month</option>
                            <option value="previous_month">Previous Month</option>
                            <option value="this_year">This Year</option>
                            <option value="all_time">All Time</option>
                        </select>
                    </div>
                </div>

                {/* Daily List View */}
                {viewMode === 'list' && (
                    <DataTable
                        columns={columns}
                        data={attendance}
                        loading={loading}
                    />
                )}

                {/* Monthly Breakdown View */}
                {viewMode === 'monthly' && (
                    <div>
                        {monthlyBreakdown.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                                No attendance records found for the selected period.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {monthlyBreakdown.map((month) => (
                                    <div
                                        key={month.key}
                                        style={{
                                            padding: '1.5rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{month.monthName}</h3>
                                                <p className="text-dim" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                                    {month.total} total days tracked
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: parseFloat(month.percentage) >= 75 ? 'var(--success)' : parseFloat(month.percentage) >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                                                    {month.percentage}%
                                                </div>
                                                <div className="text-dim" style={{ fontSize: '0.75rem' }}>Attendance</div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '12px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{
                                                width: `${month.percentage}%`,
                                                height: '100%',
                                                background: parseFloat(month.percentage) >= 75 ? 'var(--success)' : parseFloat(month.percentage) >= 50 ? 'var(--warning)' : 'var(--error)',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>

                                        {/* Stats */}
                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            <div>
                                                <span className="badge badge-success">{month.present} Present</span>
                                            </div>
                                            <div>
                                                <span className="badge badge-error">{month.absent} Absent</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
