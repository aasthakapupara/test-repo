import { useState, useEffect } from 'react';
import { Plus, Search, Building2, AlertCircle, Eye, FileText, UserCheck, GraduationCap } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null); // null for add, object for edit
    const [formData, setFormData] = useState({
        branch_name: '',
        branch_address: '',
        branch_email: '',
        branch_contact_number: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // View Details State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('students');
    const [branchDetails, setBranchDetails] = useState({
        students: [],
        attendance: [],
        results: []
    });
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await adminService.getBranches();
            setBranches(response.data.content);
        } catch (err) {
            setError('Failed to fetch branches. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const handleOpenModal = (branch = null) => {
        if (branch) {
            setCurrentBranch(branch);
            setFormData({
                branch_name: branch.branch_name,
                branch_address: branch.branch_address,
                branch_email: branch.branch_email,
                branch_contact_number: branch.branch_contact_number || branch.contact_number
            });
        } else {
            setCurrentBranch(null);
            setFormData({
                branch_name: '',
                branch_address: '',
                branch_email: '',
                branch_contact_number: ''
            });
        }
        setFormError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            const payload = {
                ...formData,
                contact_number: formData.branch_contact_number
            };
            if (currentBranch) {
                await adminService.editBranch(currentBranch.id, payload);
            } else {
                await adminService.addBranch(payload);
            }
            setIsModalOpen(false);
            fetchBranches();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Operation failed. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (branch) => {
        if (window.confirm(`Are you sure you want to delete branch "${branch.branch_name}"?`)) {
            try {
                await adminService.deleteBranch(branch.id);
                fetchBranches();
            } catch (err) {
                alert(err.response?.data?.message || 'Delete failed.');
            }
        }
    };

    // --- View Details Handlers ---
    const handleViewDetailsClick = async (branch) => {
        setCurrentBranch(branch);
        setIsDetailsModalOpen(true);
        setDetailsLoading(true);
        setActiveTab('students');

        try {
            // Fetch all related data
            // In a real app, you might want specific endpoints like /branch/:id/students
            // For now, we will fetch all and filter client-side as per current service capability
            const [studentsRes, assignmentsRes, attendanceRes, resultsRes] = await Promise.all([
                adminService.getUsers(),
                adminService.getStudentAssignments(),
                adminService.getAttendance(),
                adminService.getResults()
            ]);

            const allStudents = studentsRes.data.content.filter(u => u.role === 3);
            const allAssignments = assignmentsRes.data.content;

            // Filter students belonging to this branch
            const branchStudentIds = allAssignments
                .filter(a => a.branch_id === branch.id)
                .map(a => a.student_id);

            const branchStudents = allStudents.filter(s => branchStudentIds.includes(s.id));

            // Filter attendance and results for these students
            //const branchAttendance = attendanceRes?.data?.content?.filter(a => branchStudentIds.includes(a.student_id)) || [];
            const attendanceContent = attendanceRes?.data?.content;

            const attendanceList = Array.isArray(attendanceContent)
                ? attendanceContent
                : Array.isArray(attendanceContent?.data)
                    ? attendanceContent.data
                    : [];

            const branchAttendance = attendanceList.filter(a =>
                branchStudentIds.includes(a.user_id)
            );

            //const branchResults = resultsRes?.data?.content?.filter(r => branchStudentIds.includes(r.student_id)) || [];
            const resultsContent = resultsRes?.data?.content;

            const resultsList = Array.isArray(resultsContent)
                ? resultsContent
                : [];

            const branchResults = resultsList.filter(r =>
                branchStudentIds.includes(r.student_id)
            );


            setBranchDetails({
                students: branchStudents,
                attendance: branchAttendance,
                results: branchResults
            });

        } catch (err) {
            console.error("Failed to fetch branch details", err);
            setBranchDetails({ students: [], attendance: [], results: [] });
        } finally {
            setDetailsLoading(false);
        }
    };


    const columns = [
        { header: 'Branch Name', accessor: 'branch_name', width: '30%' },
        { header: 'Email', accessor: 'branch_email', width: '30%' },
        { header: 'Phone', accessor: 'branch_contact_number', width: '30%', render: (_, row) => row.branch_contact_number || row.contact_number },
        // {
        //     header: 'Actions',
        //     accessor: 'actions',
        //     width: '20%',
        //     render: (_, row) => (
        //         <div style={{ display: 'flex', gap: '0.5rem' }}>
        //             <button
        //                 className="btn-icon"
        //                 title="View Details"
        //                 onClick={() => handleViewDetailsClick(row)}
        //                 style={{ color: 'var(--secondary)' }}
        //             >
        //                 <Eye size={18} />
        //             </button>

        //         </div>
        //     )
        // }
    ];

    // Details Sub-components
    const renderStudentsTab = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                    </tr>
                </thead>
                <tbody>
                    {branchDetails.students.length > 0 ? (
                        branchDetails.students.map(student => (
                            <tr key={student.id}>
                                <td>{student.firstname} {student.lastname}</td>
                                <td>{student.email}</td>
                                <td>{student.mobile}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No students found in this branch.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderAttendanceTab = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {branchDetails.attendance.length > 0 ? (
                        branchDetails.attendance.map((record, index) => (
                            <tr key={index}>
                                {/* <td>{record.student_id}</td> */}
                                <td>
                                    {branchDetails.students.find(s => s.id === record.user_id)?.firstname || '—'}
                                </td>

                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status-badge ${record.status === 'Present' ? 'active' : 'inactive'}`}>
                                        {record.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No attendance records found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderResultsTab = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Test Name</th>
                        <th>Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {branchDetails.results.length > 0 ? (
                        branchDetails.results.map((result, index) => (
                            <tr key={index}>
                                <td>{result.student_id}</td>
                                <td>{result.test_name}</td>
                                <td>{result.marks_obtained} / {result.total_marks}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No results found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="module-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Branch Management</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Add, edit, or remove institute branches</p>
                </div>
                <button className="login-button" style={{ marginTop: 0 }} onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    <span>Add New Branch</span>
                </button>
            </div>

            {error && (
                <div className="error-message" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <DataTable
                columns={columns}
                data={branches}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                loading={loading}
                customActions={(row) => (
                    <button
                        title="View Branch Dashboard"
                        onClick={() => handleViewDetailsClick(row)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-dim)',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }}
                    >
                        <Eye size={16} />
                    </button>

                )}
            />

            {/* Add/Edit Branch Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentBranch ? 'Edit Branch' : 'Add New Branch'}
            >
                <form className="login-form" onSubmit={handleSubmit}>
                    {formError && <div className="error-message">{formError}</div>}

                    <div className="form-group">
                        <label>Branch Name</label>
                        <div className="input-wrapper">
                            <Building2 size={18} style={{ left: '1rem', position: 'absolute' }} />
                            <input
                                type="text"
                                placeholder="Ex: Downtown Branch"
                                value={formData.branch_name}
                                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                required
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="branch@example.com"
                            value={formData.branch_email}
                            onChange={(e) => setFormData({ ...formData, branch_email: e.target.value })}
                            required
                            className="input-wrapper"
                            style={{ padding: '0.875rem 1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'white' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Number</label>
                        <input
                            type="text"
                            placeholder="1234567890"
                            value={formData.branch_contact_number}
                            onChange={(e) => setFormData({ ...formData, branch_contact_number: e.target.value })}
                            required
                            style={{ padding: '0.875rem 1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'white' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            placeholder="Full address of the branch"
                            value={formData.branch_address}
                            onChange={(e) => setFormData({ ...formData, branch_address: e.target.value })}
                            required
                            rows={3}
                            style={{ padding: '0.875rem 1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'white', resize: 'none' }}
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="nav-item" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}>Cancel</button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={formLoading}
                        >
                            {formLoading ? 'Saving...' : 'Save Branch'}
                        </button>
                    </div>
                </form>
            </Modal>


            {/* View Branch Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title={`${currentBranch?.branch_name || 'Branch'} Details`}
            >
                <div>
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                        <button
                            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                            onClick={() => setActiveTab('students')}
                            style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', color: activeTab === 'students' ? 'var(--primary)' : 'var(--text-dim)', borderBottom: activeTab === 'students' ? '2px solid var(--primary)' : 'none', cursor: 'pointer' }}
                        >
                            <UserCheck size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Students
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('attendance')}
                            style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', color: activeTab === 'attendance' ? 'var(--primary)' : 'var(--text-dim)', borderBottom: activeTab === 'attendance' ? '2px solid var(--primary)' : 'none', cursor: 'pointer' }}
                        >
                            <FileText size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Attendance
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
                            onClick={() => setActiveTab('results')}
                            style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', color: activeTab === 'results' ? 'var(--primary)' : 'var(--text-dim)', borderBottom: activeTab === 'results' ? '2px solid var(--primary)' : 'none', cursor: 'pointer' }}
                        >
                            <GraduationCap size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Results
                        </button>
                    </div>

                    <div style={{ minHeight: '300px' }}>
                        {detailsLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading details...</div>
                        ) : (
                            <>
                                {activeTab === 'students' && renderStudentsTab()}
                                {activeTab === 'attendance' && renderAttendanceTab()}
                                {activeTab === 'results' && renderResultsTab()}
                            </>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BranchManagement;
