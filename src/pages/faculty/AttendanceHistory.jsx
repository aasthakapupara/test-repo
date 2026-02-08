import { useState, useEffect } from 'react';
import { Calendar, Edit2, History, AlertCircle, CheckCircle } from 'lucide-react';
import facultyService from '../../services/facultyService';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import AttendanceEditModal from '../../components/AttendanceEditModal';
import { useAuth } from '../../context/AuthContext';

const AttendanceHistory = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [status, setStatus] = useState(null);
    const [dateFilter, setDateFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attendanceRes, branchesRes, usersRes, assignmentsRes] = await Promise.all([
                facultyService.getAttendance({}),
                adminService.getBranches(),
                facultyService.getUsers(),
                facultyService.getMyAssignments()
            ]);

            const users = usersRes.data.content || [];
            const myBranchIds = (assignmentsRes.data.content || [])
                .filter(a => a.faculty_id === user.id)
                .map(a => a.branch_id);

            // Enrich attendance records
            const enrichedRecords = (attendanceRes.data.content?.records || []).map(record => {
                const student = users.find(u => u.id === record.user_id);
                return {
                    ...record,
                    student_name: student ? `${student.firstname} ${student.lastname}` : 'Unknown',
                    student_email: student?.email || 'N/A'
                };
            });

            // Filter to only show records from faculty's branches
            const myRecords = enrichedRecords; // In production, filter by branch

            setAttendance(myRecords);
            setBranches(branchesRes.data.content || []);
        } catch (error) {
            console.error('Error fetching attendance history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setSelectedRecord(record);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async ({ id, status: newStatus, editReason }) => {
        try {
            await facultyService.editAttendance(id, {
                status: newStatus,
                edit_reason: editReason
            });

            setStatus({
                type: 'success',
                message: 'Attendance record updated successfully'
            });

            setIsEditModalOpen(false);
            fetchData();

            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update attendance');
        }
    };

    const filteredAttendance = attendance.filter(record => {
        const matchesDate = !dateFilter || record.date?.startsWith(dateFilter);
        return matchesDate;
    });

    const columns = [
        {
            accessor: 'student_name',
            header: 'Student',
            render: (val, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{row.student_email}</div>
                </div>
            )
        },
        {
            accessor: 'date',
            header: 'Date',
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} className="text-dim" />
                    {val ? new Date(val).toLocaleDateString() : 'N/A'}
                </div>
            )
        },
        {
            accessor: 'status',
            header: 'Status',
            render: (val) => (
                <span className={`badge ${val === 'present' ? 'badge-success' : 'badge-error'}`}>
                    {val || 'N/A'}
                </span>
            )
        },
        {
            accessor: 'actions',
            header: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(row)}
                        title="Edit attendance record"
                    >
                        <Edit2 size={14} />
                        Edit
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Attendance History</h1>
                    <p>View and edit attendance records</p>
                </div>
            </div>

            {status && (
                <div className={`alert alert-${status.type}`} style={{ marginBottom: '1.5rem' }}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {status.message}
                </div>
            )}

            <div className="content-card">
                <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label>Filter by Date</label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredAttendance}
                    loading={loading}
                />
            </div>

            <AttendanceEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                record={selectedRecord}
                onSave={handleSaveEdit}
            />
        </div>
    );
};

export default AttendanceHistory;
