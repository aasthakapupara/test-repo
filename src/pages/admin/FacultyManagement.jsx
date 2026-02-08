import { useState, useEffect } from 'react';
import { Plus, Search, User, Briefcase, MapPin, AlertCircle, Link } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import CustomSelect from '../../components/common/CustomSelect';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [branches, setBranches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [subjectAssignments, setSubjectAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [currentFaculty, setCurrentFaculty] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        mobile: '',
        password: '',
        role: 2
    });

    const [assignData, setAssignData] = useState({
        faculty_id: '',
        branch_id: ''
    });

    const [subjectAssignData, setSubjectAssignData] = useState({
        faculty_to_branch_id: '',
        subject_id: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, branchRes, assignRes, subjectRes] = await Promise.all([
                adminService.getUsers(),
                adminService.getBranches(),
                adminService.getFacultyAssignments(),
                adminService.getSubjects()
            ]);

            const allUsers = userRes.data.content || [];
            setFaculty(allUsers.filter(user => user.role === 2));
            setBranches(branchRes.data.content || []);
            setAssignments(assignRes.data.content || []);
            setSubjects(subjectRes.data.content || []);

            // Fetch subject assignments if endpoint exists
            try {
                const subjectAssignRes = await adminService.getFacultySubjectAssignments();
                setSubjectAssignments(subjectAssignRes.data.content || []);
            } catch (err) {
                console.error('Error fetching subject assignments:', err);
                setSubjectAssignments([]);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching faculty data:', err);
            // Fallback for development
            if (err.response?.status === 404) {
                setFaculty([
                    { id: 3, firstname: 'Dr. Robert', lastname: 'Wilson', email: 'robert@example.com', mobile: '9876543212', role: 2 },
                    { id: 4, firstname: 'Prof. Sarah', lastname: 'Adams', email: 'sarah@example.com', mobile: '9876543213', role: 2 }
                ]);
                setBranches([{ id: 1, branch_name: 'Main Campus' }]);
            } else {
                setError('Failed to fetch faculty data.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignInputChange = (e) => {
        const { name, value } = e.target;
        setAssignData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentFaculty) {
                await adminService.editUser(currentFaculty.id, formData);
            } else {
                await adminService.addUser(formData);
            }
            setIsModalOpen(false);
            fetchData();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving faculty');
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.assignFacultyBranch(assignData);
            // Don't close modal, just refresh data to show new assignment in list
            fetchData();
            setSuccess('Branch assigned successfully!');
            setAssignData(prev => ({ ...prev, branch_id: '' })); // Reset selection
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error assigning faculty to branch');
        }
    };

    const handleRemoveAssignment = async (assignmentId) => {
        if (window.confirm('Are you sure you want to remove this branch assignment?')) {
            try {
                await adminService.deleteFacultyAssignment(assignmentId);
                fetchData();
            } catch (err) {
                console.error("Failed to remove assignment", err);
                setError('Failed to remove assignment.');
            }
        }
    };

    // Helper to get assignments for the current modal faculty
    const getCurrentFacultyAssignments = () => {
        if (!currentFaculty) return [];
        return assignments.filter(a => a.faculty_id === currentFaculty.id).map(a => {
            const branch = branches.find(b => b.id === a.branch_id);
            return {
                ...a,
                branch_name: branch ? branch.branch_name : 'Unknown Branch'
            };
        });
    };

    const handleEdit = (facultyMember) => {
        setCurrentFaculty(facultyMember);
        setFormData({
            firstname: facultyMember.firstname,
            lastname: facultyMember.lastname,
            email: facultyMember.email,
            mobile: facultyMember.mobile,
            password: '',
            role: 2
        });
        setIsModalOpen(true);
    };

    const handleAssign = (facultyMember) => {
        setAssignData({
            faculty_id: facultyMember.id,
            branch_id: ''
        });
        setCurrentFaculty(facultyMember);
        setError(null);
        setSuccess(null);
        setIsAssignModalOpen(true);
    };

    const handleAssignSubject = (facultyMember) => {
        setCurrentFaculty(facultyMember);
        setError(null);
        setSuccess(null);

        // Get faculty's branch assignments
        const facultyAssignments = assignments.filter(a => a.faculty_id === facultyMember.id);

        if (facultyAssignments.length === 0) {
            setError('This faculty member must be assigned to a branch before assigning subjects.');
            setTimeout(() => setError(null), 5000);
            return;
        }

        // Set first assignment as default
        setSubjectAssignData({
            faculty_to_branch_id: facultyAssignments[0].faculty_to_branch_id || facultyAssignments[0].id,
            subject_id: ''
        });
        setIsSubjectModalOpen(true);
    };

    const handleSubjectAssignSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminService.assignFacultySubject(subjectAssignData);
            fetchData();
            setSuccess('Subject assigned successfully!');
            setSubjectAssignData(prev => ({ ...prev, subject_id: '' }));
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error assigning subject to faculty');
        }
    };

    const handleDelete = async (facultyMember) => {
        if (window.confirm(`Are you sure you want to delete ${facultyMember.firstname}?`)) {
            try {
                await adminService.deleteUser(facultyMember.id);
                fetchData();
            } catch (err) {
                setError('Error deleting faculty Member');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            firstname: '',
            lastname: '',
            email: '',
            mobile: '',
            password: '',
            role: 2
        });
        setCurrentFaculty(null);
    };

    const getAssignedBranches = (facultyId) => {
        return assignments
            .filter(a => a.faculty_id === facultyId)
            .map(a => branches.find(b => b.id === a.branch_id)?.branch_name)
            .filter(Boolean)
            .join(', ') || 'Not assigned';
    };

    const getAssignedSubjects = (facultyId) => {
        // Get all branch assignments for this faculty
        const facultyBranchAssignments = assignments.filter(a => a.faculty_id === facultyId);

        // Get subject assignments for these branch assignments
        const facultySubjects = subjectAssignments
            .filter(sa => {
                const branchAssignment = facultyBranchAssignments.find(
                    fba => (fba.faculty_to_branch_id || fba.id) === sa.faculty_to_branch_id
                );
                return branchAssignment !== undefined;
            })
            .map(sa => {
                const subject = subjects.find(s => s.id === sa.subject_id);
                return subject ? subject.subject_name : null;
            })
            .filter(Boolean);

        // Remove duplicates and join
        return [...new Set(facultySubjects)].join(', ') || 'Not assigned';
    };

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'firstname',
            render: (val, row) => `${row.firstname} ${row.lastname}`
        },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Assigned Branches',
            accessor: 'id',
            render: (id) => getAssignedBranches(id)
        },
        {
            header: 'Assigned Subjects',
            accessor: 'id',
            render: (id) => getAssignedSubjects(id)
        },
        // {
        //     header: 'Status',
        //     accessor: 'status',
        //     render: () => <span className="status-badge active">Active</span>
        // }
    ];

    const filteredFaculty = faculty.filter(f =>
        `${f.firstname} ${f.lastname} ${f.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Faculty Management</h1>
                    <p>Manage faculty profiles and branch assignments</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                    >
                        <Plus size={20} />
                        Add Faculty
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
                <div className="card-filters">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search faculty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredFaculty}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={loading}
                    customActions={(member) => (
                        <>
                            <button
                                className="action-btn assign"
                                title="Assign Branch"
                                onClick={() => handleAssign(member)}
                            >
                                <MapPin size={18} />
                            </button>
                            <button
                                className="action-btn assign"
                                title="Assign Subject"
                                onClick={() => handleAssignSubject(member)}
                            >
                                <Briefcase size={18} />
                            </button>
                        </>
                    )}
                />
            </div>

            {/* Add/Edit User Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentFaculty ? 'Edit Faculty' : 'Add New Faculty'}
            >
                <form onSubmit={handleSubmit} className="management-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    {!currentFaculty && (
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-text" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {currentFaculty ? 'Update Faculty' : 'Save Faculty'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Branch Assignment Modal */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title={`Manage Branches for ${currentFaculty?.firstname}`}
            >
                <div style={{ marginBottom: '1.5rem' }}>
                    {success && <div className="alert alert-success" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid #22c55e', marginBottom: '1rem' }}>{success}</div>}
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current Assignments</h4>
                    {getCurrentFacultyAssignments().length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {getCurrentFacultyAssignments().map(assignment => (
                                <div key={assignment.faculty_to_branch_id || assignment.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)'
                                }}>
                                    <span>{assignment.branch_name}</span>
                                    <button
                                        onClick={() => handleRemoveAssignment(assignment.faculty_to_branch_id || assignment.id)}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                        title="Remove Assignment"
                                    >
                                        <div style={{ width: '18px', height: '18px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No branches assigned yet.</p>
                    )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Assign New Branch</h4>
                    <form onSubmit={handleAssignSubmit} className="management-form">
                        <CustomSelect
                            label=""
                            name="branch_id"
                            value={assignData.branch_id}
                            options={branches.map(b => ({ label: b.branch_name, value: b.id }))}
                            onChange={handleAssignInputChange}
                            placeholder="Choose a branch..."
                        />
                        <div className="modal-footer" style={{ marginTop: '1rem' }}>
                            <button type="button" className="btn btn-text" onClick={() => setIsAssignModalOpen(false)}>Done</button>
                            <button type="submit" className="btn btn-primary">Assign Branch</button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Subject Assignment Modal */}
            <Modal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                title={`Assign Subject to ${currentFaculty?.firstname}`}
            >
                <div style={{ marginBottom: '1.5rem' }}>
                    {success && <div className="alert alert-success" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid #22c55e', marginBottom: '1rem' }}>{success}</div>}
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Assign Subject</h4>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        Select a branch and subject to assign. Faculty can have different subjects for different branches.
                    </p>
                </div>

                <form onSubmit={handleSubjectAssignSubmit} className="management-form">
                    <CustomSelect
                        label="Branch"
                        name="faculty_to_branch_id"
                        value={subjectAssignData.faculty_to_branch_id}
                        options={getCurrentFacultyAssignments().map(a => ({
                            label: a.branch_name,
                            value: a.faculty_to_branch_id || a.id
                        }))}
                        onChange={(e) => setSubjectAssignData(prev => ({ ...prev, faculty_to_branch_id: e.target.value }))}
                        placeholder="Choose a branch..."
                    />
                    <CustomSelect
                        label="Subject"
                        name="subject_id"
                        value={subjectAssignData.subject_id}
                        options={subjects.map(s => ({ label: s.subject_name, value: s.id }))}
                        onChange={(e) => setSubjectAssignData(prev => ({ ...prev, subject_id: e.target.value }))}
                        placeholder="Choose a subject..."
                    />
                    <div className="modal-footer" style={{ marginTop: '1rem' }}>
                        <button type="button" className="btn btn-text" onClick={() => setIsSubjectModalOpen(false)}>Done</button>
                        <button type="submit" className="btn btn-primary">Assign Subject</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FacultyManagement;
