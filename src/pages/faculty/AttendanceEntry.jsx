import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Calendar, Users, Info, Download } from 'lucide-react';
import facultyService from '../../services/facultyService';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../hooks/useAttendance';
import { useFileSelection } from '../../hooks/useFileSelection';

const AttendanceEntry = () => {
    const { user } = useAuth();
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [entryMode, setEntryMode] = useState('csv');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);

    // Custom Hooks
    const {
        loading: attendanceLoading,
        status,
        setStatus,
        attendanceData,
        setAttendanceData,
        markAttendanceCSV,
        markAttendanceManual,
        toggleStudent
    } = useAttendance();

    const {
        file,
        error: fileError,
        handleFileChange,
        clearFile
    } = useFileSelection(['.csv']);

    const [fetchingStudents, setFetchingStudents] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (entryMode === 'manual' && selectedBranch) {
            fetchStudentsForBranch();
        }
    }, [selectedBranch, entryMode]);

    const fetchInitialData = async () => {
        try {
            const [branchesRes, myAssignmentsRes] = await Promise.all([
                adminService.getBranches(),
                facultyService.getMyAssignments()
            ]);

            const myBranchIds = myAssignmentsRes.data.content
                .filter(a => a.faculty_id === user.id)
                .map(a => a.branch_id);

            const filteredBranches = branchesRes.data.content.filter(b => myBranchIds.includes(b.id));
            setBranches(filteredBranches);
            if (filteredBranches.length > 0) setSelectedBranch(filteredBranches[0].id);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchStudentsForBranch = async () => {
        try {
            setFetchingStudents(true);
            const [usersRes, assignmentsRes] = await Promise.all([
                facultyService.getUsers(),
                facultyService.getStudentAssignments()
            ]);

            const branchStudentIds = assignmentsRes.data.content
                .filter(a => a.branch_id === parseInt(selectedBranch))
                .map(a => a.user_id);

            const branchStudents = usersRes.data.content.filter(u => branchStudentIds.includes(u.id));
            setStudents(branchStudents);

            // Initialize attendance data in hook
            const initialData = {};
            branchStudents.forEach(s => { initialData[s.id] = 'present'; });
            setAttendanceData(initialData);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleCSVSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        try {
            await markAttendanceCSV(file);
            clearFile();
        } catch (err) { /* State handled by hook */ }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const records = Object.entries(attendanceData).map(([studentId, status]) => ({
            user_id: parseInt(studentId),
            date: attendanceDate,
            status: status
        }));
        try {
            await markAttendanceManual(records);
        } catch (err) { /* State handled by hook */ }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "Email,Attendance Date,Attendance Status\nstudent@example.com,2024-01-01,present";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const isLoading = attendanceLoading || fetchingStudents;

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Attendance Management</h1>
                    <p>Register student presence via CSV upload or manual entry.</p>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                <div
                    className={`stat-card ${entryMode === 'csv' ? 'active' : ''}`}
                    style={{ cursor: 'pointer', '--accent-color': 'var(--primary)' }}
                    onClick={() => { setEntryMode('csv'); setStatus(null); }}
                >
                    <div className="stat-icon"><Upload /></div>
                    <div className="stat-info">
                        <h3>CSV Bulk</h3>
                        <p>Upload records</p>
                    </div>
                </div>
                <div
                    className={`stat-card ${entryMode === 'manual' ? 'active' : ''}`}
                    style={{ cursor: 'pointer', '--accent-color': 'var(--success)' }}
                    onClick={() => { setEntryMode('manual'); setStatus(null); }}
                >
                    <div className="stat-icon"><Users /></div>
                    <div className="stat-info">
                        <h3>Manual Entry</h3>
                        <p>Toggle presence</p>
                    </div>
                </div>
            </div>

            {entryMode === 'csv' ? (
                <div className="content-card animate-slide">
                    <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Info size={20} />
                            <div>
                                <strong>CSV Format:</strong> email, date (YYYY-MM-DD), status (present/absent)
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="btn btn-text"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                            <Download size={16} /> Download Template
                        </button>
                    </div>

                    <form onSubmit={handleCSVSubmit} style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <div style={{ padding: '4rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)' }}>
                            <input
                                type="file"
                                id="csv-file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(e.target.files[0])}
                            />
                            <label htmlFor="csv-file" style={{ cursor: 'pointer' }}>
                                <Upload size={48} className="text-primary" style={{ marginBottom: '1rem' }} />
                                <h3>{file ? file.name : 'Select CSV File'}</h3>
                                <p className="text-dim">Drag and drop or click to browse</p>
                            </label>
                        </div>

                        {fileError && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{fileError}</div>}

                        {status && (
                            <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1.5rem' }}>
                                {status.message}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem' }} disabled={!file || isLoading}>
                            {isLoading ? 'Processing...' : 'Upload Attendance'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="content-card animate-slide">
                    <div className="form-row">
                        <div className="form-group">
                            <label><Calendar size={16} /> Attendance Date</label>
                            <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label><Users size={16} /> Select Branch</label>
                            <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        {fetchingStudents && <div className="loading-spinner">Loading Students...</div>}
                        {!fetchingStudents && students.length > 0 && (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Email</th>
                                            <th style={{ textAlign: 'center' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => (
                                            <tr key={student.id}>
                                                <td>{student.firstname} {student.lastname}</td>
                                                <td className="text-dim">{student.email}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        className={`btn ${attendanceData[student.id] === 'present' ? 'btn-primary' : 'btn-secondary'}`}
                                                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                                        onClick={() => toggleStudent(student.id)}
                                                    >
                                                        {attendanceData[student.id] === 'present' ? 'Present' : 'Absent'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!fetchingStudents && students.length === 0 && selectedBranch && (
                            <div className="empty-state">No students found in this branch.</div>
                        )}
                    </div>

                    {status && (
                        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1.5rem' }}>
                            {status.message}
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleManualSubmit} disabled={students.length === 0 || isLoading}>
                            {isLoading ? 'Submitting...' : 'Mark Attendance'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceEntry;
