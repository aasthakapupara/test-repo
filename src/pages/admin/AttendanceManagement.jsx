import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, Upload, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import CustomSelect from '../../components/common/CustomSelect';

const AttendanceManagement = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    const navigate = useNavigate();

    const handleEdit = (row) => {
        setSelectedAttendance(row);
        setIsEditModalOpen(true);
    };

    const updateAttendance = async () => {
        try {
            const payload = {
                user_id: selectedAttendance.user_id,
                attendance_date: selectedAttendance.date,
                status: selectedAttendance.status
            };


            await adminService.editAttendance(
                selectedAttendance.id,
                payload
            );

            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Update failed', err);
        }
    };



    const handleDelete = async (row) => {
        if (!window.confirm('Delete this attendance record?')) return;

        try {
            await adminService.deleteAttendance(row.id);
            fetchData();
        } catch (err) {
            console.error('Delete failed', err);
        }
    };



    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        filter: 'this_month',
        start_date: '',
        end_date: '',
        page: 1,
        limit: 20
    });

    // Modal states
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // const fetchData = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await adminService.getAttendance(filters);
    //         setAttendance(response.data.content.data || []);
    //         console.log('Attendance row:', response.data.content.data[0]);
    //         setPagination(response.data.content.pagination || { currentPage: 1, totalPages: 1 });
    //         setError(null);
    //     } catch (err) {
    //         console.error('Error fetching attendance:', err);
    //         // Fallback for development
    //         if (err.response?.status === 404) {
    //             setAttendance([
    //                 { id: 1, user_id: 1, date: '2026-02-01', status: 'present', firstname: 'John', lastname: 'Doe' },
    //                 { id: 2, user_id: 2, date: '2026-02-01', status: 'absent', firstname: 'Jane', lastname: 'Smith' }
    //             ]);
    //         } else {
    //             setError('Failed to fetch attendance data.');
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1️⃣ Fetch attendance
            const attendanceRes = await adminService.getAttendance(filters);
            const attendanceData = attendanceRes.data.content.data || [];

            // 2️⃣ Fetch users (students)
            const usersRes = await adminService.getUsers();
            const users = usersRes.data.content || [];

            // 3️⃣ Build userId → email map
            const emailMap = {};
            users.forEach(u => {
                emailMap[u.id] = u.email;
            });

            // 4️⃣ Attach email to attendance rows
            const attendanceWithEmail = attendanceData.map(a => ({
                ...a,
                email: emailMap[a.user_id] || null
            }));

            // 5️⃣ Set state
            setAttendance(attendanceWithEmail);
            setPagination(
                attendanceRes.data.content.pagination || { currentPage: 1, totalPages: 1 }
            );
            setError(null);

        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('Failed to fetch attendance data.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, [filters.page, filters.filter, filters.status]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('csv', uploadFile);

            const response = await adminService.uploadAttendance(formData);
            setUploadResult(response.data.content);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading attendance');
        } finally {
            setUploading(false);
        }
    };

    const columns = [
        {
            header: 'Student Email',
            accessor: 'user_id',
            render: (_, row) => row.email || '—'
        }
        ,

        {
            header: 'Date',
            accessor: 'date',
            render: (val) => {
                const d = new Date(val);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const yyyy = d.getFullYear();
                return `${mm}-${dd}-${yyyy}`;
            }
        }
        ,
        {
            header: 'Status',
            accessor: 'status',
            render: (val) => {
                const isPresent = val === 'present';

                return (
                    <span
                        style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: isPresent
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)',
                            color: isPresent
                                ? 'rgb(34, 197, 94)'
                                : 'rgb(239, 68, 68)',
                        }}
                    >
                        {val.toUpperCase()}
                    </span>
                );
            }
        }


    ];

    const filteredAttendance = attendance.filter((row) => {
        if (!filters.search) return true;

        return row.email
            ?.toLowerCase()
            .includes(filters.search.toLowerCase());
    });


    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Attendance Management</h1>
                    <p>Track student presence and upload record sheets</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => { setUploadResult(null); setIsBulkModalOpen(true); }}
                    >
                        <Upload size={20} />
                        Upload Attendance
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/admin/attendance-reports')}
                    >
                        View Attendance Reports
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="content-card">
                <form className="card-filters" onSubmit={handleSearch}>
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by student email..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                        <div style={{ minWidth: '160px' }}>
                            <CustomSelect
                                name="filter"
                                value={filters.filter}
                                options={[
                                    { label: 'Today', value: 'today' },
                                    { label: 'Yesterday', value: 'yesterday' },
                                    { label: 'This Week', value: 'this_week' },
                                    { label: 'This Month', value: 'this_month' },
                                    { label: 'Custom Range', value: 'custom' }
                                ]}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div style={{ minWidth: '140px' }}>
                            <CustomSelect
                                name="status"
                                value={filters.status}
                                options={[
                                    { label: 'All Status', value: '' },
                                    { label: 'Present', value: 'present' },
                                    { label: 'Absent', value: 'absent' }
                                ]}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <button type="submit" className="btn btn-icon" title="Apply filters" style={{ height: '48px', width: '48px', padding: 0 }}>
                            <Filter size={20} />
                        </button>
                    </div>
                </form>

                {filters.filter === 'custom' && (
                    <div className="custom-date-range">
                        <div className="form-group inline">
                            <label>From:</label>
                            <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
                        </div>
                        <div className="form-group inline">
                            <label>To:</label>
                            <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
                        </div>
                    </div>
                )}

                <DataTable
                    columns={columns}
                    data={filteredAttendance}
                    //isLoading={loading}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                // No edit/delete for attendance by default in this view
                />

                {pagination.totalPages > 1 && (
                    <div className="pagination">
                        <button
                            disabled={filters.page === 1}
                            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                        >
                            Previous
                        </button>
                        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                        <button
                            disabled={filters.page === pagination.totalPages}
                            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Upload Attendance CSV"
            >
                {!uploadResult ? (
                    <form onSubmit={handleFileUpload} className="bulk-upload-container">
                        <div className="upload-info">
                            <FileText size={48} />
                            <p>Upload CSV with Columns: <b>Email, Date, Status</b></p>
                            {/* <a href="#" className="download-link">Download Template</a> */}
                        </div>
                        <div className="file-drop-zone">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                required
                            />
                            <p>{uploadFile ? uploadFile.name : 'Click to select attendance file'}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-text" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Start Upload'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="upload-success-state">
                        <CheckCircle size={48} color="#22c55e" />
                        <h3>Upload Complete</h3>
                        <p>Records Inserted: <b>{uploadResult.inserted}</b></p>
                        <p>Records Skipped: <b>{uploadResult.skipped}</b></p>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setIsBulkModalOpen(false)}>Done</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Attendance"
            >
                {selectedAttendance && (
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            value={selectedAttendance.status}
                            onChange={(e) =>
                                setSelectedAttendance({
                                    ...selectedAttendance,
                                    status: e.target.value
                                })
                            }
                        >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                        </select>

                        <div className="modal-footer">
                            <button
                                className="btn btn-text"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={updateAttendance}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default AttendanceManagement;
