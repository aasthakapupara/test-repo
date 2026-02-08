import { useState, useEffect } from 'react';
import { Plus, GraduationCap, AlertCircle, Hash } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);
    const [formData, setFormData] = useState({
        class_name: '',
        class_slug: '',
        status: 'active'
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await adminService.getClasses();
            setClasses(response.data.content);
        } catch (err) {
            setError('Failed to fetch classes.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setCurrentClass(item);
            setFormData({
                class_name: item.class_name,
                class_slug: item.class_slug,
                status: item.status || 'active'
            });
        } else {
            setCurrentClass(null);
            setFormData({
                class_name: '',
                class_slug: '',
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
            if (currentClass) {
                await adminService.editClass(currentClass.id, formData);
            } else {
                await adminService.addClass(formData);
            }
            setIsModalOpen(false);
            fetchClasses();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Operation failed.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Delete class "${item.class_name}"?`)) {
            try {
                await adminService.deleteClass(item.id);
                fetchClasses();
            } catch (err) {
                alert(err.response?.data?.message || 'Delete failed.');
            }
        }
    };

    const columns = [
        { header: 'Class Name', accessor: 'class_name', width: '30%' },
        { header: 'Slug', accessor: 'class_slug', width: '30%' },
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
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Class Management</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage school classes (9th - 12th etc.)</p>
                </div>
                <button className="login-button" style={{ marginTop: 0 }} onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    <span>Add New Class</span>
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <DataTable
                columns={columns}
                data={classes}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                loading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentClass ? 'Edit Class' : 'Add New Class'}
                footer={
                    <>
                        <button className="nav-item" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}>Cancel</button>
                        <button className="login-button" style={{ marginTop: 0 }} disabled={formLoading} onClick={handleSubmit}>
                            {formLoading ? 'Saving...' : 'Save Class'}
                        </button>
                    </>
                }
            >
                <form className="login-form" onSubmit={handleSubmit}>
                    {formError && <div className="error-message">{formError}</div>}

                    <div className="form-group">
                        <label>Class Name</label>
                        <div className="input-wrapper">
                            <GraduationCap size={18} style={{ left: '1rem', position: 'absolute' }} />
                            <input
                                type="text"
                                placeholder="Ex: Class 10th"
                                value={formData.class_name}
                                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
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
                                placeholder="Ex: class-10"
                                value={formData.class_slug}
                                onChange={(e) => setFormData({ ...formData, class_slug: e.target.value })}
                                required
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    {currentClass && (
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

export default ClassManagement;
