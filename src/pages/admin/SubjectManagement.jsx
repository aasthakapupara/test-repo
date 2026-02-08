import { useState, useEffect } from 'react';
import { Plus, BookOpen, AlertCircle, Hash } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState(null);
    const [formData, setFormData] = useState({
        subject_name: '',
        subject_slug: '',
        status: 'active'
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const response = await adminService.getSubjects();
            setSubjects(response.data.content);
        } catch (err) {
            setError('Failed to fetch subjects.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setCurrentSubject(item);
            setFormData({
                subject_name: item.subject_name,
                subject_slug: item.subject_slug,
                status: item.status || 'active'
            });
        } else {
            setCurrentSubject(null);
            setFormData({
                subject_name: '',
                subject_slug: '',
                status: 'active'
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
            if (currentSubject) {
                await adminService.editSubject(currentSubject.id, formData);
            } else {
                await adminService.addSubject(formData);
            }
            setIsModalOpen(false);
            fetchSubjects();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Operation failed.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Delete subject "${item.subject_name}"?`)) {
            try {
                await adminService.deleteSubject(item.id);
                fetchSubjects();
            } catch (err) {
                alert(err.response?.data?.message || 'Delete failed.');
            }
        }
    };

    const columns = [
        { header: 'Subject Name', accessor: 'subject_name', width: '40%' },
        { header: 'Slug', accessor: 'subject_slug', width: '30%' },
        {
            header: 'Status',
            accessor: 'status',
            width: '30%',
            render: (_, row) => (
                <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: row.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: row.status === 'active' ? '#22c55e' : '#ef4444'
                }}>
                    {row.status?.toUpperCase() || 'ACTIVE'}
                </span>
            )
        },
    ];

    return (
        <div className="module-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Subject Management</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage academic subjects (Physics, Chemistry etc.)</p>
                </div>
                <button className="login-button" style={{ marginTop: 0 }} onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    <span>Add New Subject</span>
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <DataTable
                columns={columns}
                data={subjects}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                loading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentSubject ? 'Edit Subject' : 'Add New Subject'}
                footer={
                    <>
                        <button className="nav-item" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}>Cancel</button>
                        <button className="login-button" style={{ marginTop: 0 }} disabled={formLoading} onClick={handleSubmit}>
                            {formLoading ? 'Saving...' : 'Save Subject'}
                        </button>
                    </>
                }
            >
                <form className="login-form" onSubmit={handleSubmit}>
                    {formError && <div className="error-message">{formError}</div>}

                    <div className="form-group">
                        <label>Subject Name</label>
                        <div className="input-wrapper">
                            <BookOpen size={18} style={{ left: '1rem', position: 'absolute' }} />
                            <input
                                type="text"
                                placeholder="Ex: Organic Chemistry"
                                value={formData.subject_name}
                                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                                required
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Slug (Unique Identifier)</label>
                        <div className="input-wrapper">
                            <Hash size={18} style={{ left: '1rem', position: 'absolute' }} />
                            <input
                                type="text"
                                placeholder="Ex: chem-org"
                                value={formData.subject_slug}
                                onChange={(e) => setFormData({ ...formData, subject_slug: e.target.value })}
                                required
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    {currentSubject && (
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{ padding: '0.875rem 1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'white', outline: 'none' }}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default SubjectManagement;
