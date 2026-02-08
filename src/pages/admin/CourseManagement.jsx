import { useState, useEffect } from 'react';
import { Plus, BookOpen, AlertCircle, Hash } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [formData, setFormData] = useState({
        course_name: '',
        course_slug: '',
        status: 'active'
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await adminService.getCourses();
            setCourses(response.data.content);
        } catch (err) {
            setError('Failed to fetch courses.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setCurrentCourse(item);
            setFormData({
                course_name: item.course_name,
                course_slug: item.course_slug,
                status: item.status || 'active'
            });
        } else {
            setCurrentCourse(null);
            setFormData({
                course_name: '',
                course_slug: '',
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
            if (currentCourse) {
                await adminService.editCourse(currentCourse.id, formData);
            } else {
                await adminService.addCourse(formData);
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Operation failed.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Delete course "${item.course_name}"?`)) {
            try {
                await adminService.deleteCourse(item.id);
                fetchCourses();
            } catch (err) {
                alert(err.response?.data?.message || 'Delete failed.');
            }
        }
    };

    const columns = [
        { header: 'Course Name', accessor: 'course_name', width: '30%' },
        { header: 'Slug', accessor: 'course_slug', width: '30%' },
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
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Course Management</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage institute courses (NEET, JEE, Foundation etc.)</p>
                </div>
                <button className="login-button" style={{ marginTop: 0 }} onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    <span>Add New Course</span>
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <DataTable
                columns={columns}
                data={courses}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                loading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentCourse ? 'Edit Course' : 'Add New Course'}
                footer={
                    <>
                        <button className="nav-item" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}>Cancel</button>
                        <button className="login-button" style={{ marginTop: 0 }} disabled={formLoading} onClick={handleSubmit}>
                            {formLoading ? 'Saving...' : 'Save Course'}
                        </button>
                    </>
                }
            >
                <form className="login-form" onSubmit={handleSubmit}>
                    {formError && <div className="error-message">{formError}</div>}

                    <div className="form-group">
                        <label>Course Name</label>
                        <div className="input-wrapper">
                            <BookOpen size={18} style={{ left: '1rem', position: 'absolute' }} />
                            <input
                                type="text"
                                placeholder="Ex: NEET Preparation"
                                value={formData.course_name}
                                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
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
                                placeholder="Ex: neet-2026"
                                value={formData.course_slug}
                                onChange={(e) => setFormData({ ...formData, course_slug: e.target.value })}
                                required
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    {currentCourse && (
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

export default CourseManagement;
