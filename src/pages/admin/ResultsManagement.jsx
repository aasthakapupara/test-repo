import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, Trash2, Edit, AlertCircle, CheckCircle, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import CustomSelect from '../../components/common/CustomSelect';

const ResultsManagement = () => {
    const [results, setResults] = useState([]);
    const [students, setStudents] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentResult, setCurrentResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        student_id: '',
        test_id: '',
        obtained_marks: '',
        total_marks: ''
    });
    const [files, setFiles] = useState({
        test_results: null,
        marksheet: null,
        answersheet: null
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resData, studentData, testData] = await Promise.all([
                adminService.getResults(),
                adminService.getUsers(),
                adminService.getTests()
            ]);

            setResults(resData.data.content || []);
            const allUsers = studentData.data.content || [];
            setStudents(allUsers.filter(u => u.role === 3));
            setTests(testData.data.content || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching results data:', err);
            if (err.response?.status === 404) {
                // Mock data for dev
                setResults([
                    { id: 1, student_id: 1, test_id: 1, created_at: new Date().toISOString() }
                ]);
                setStudents([{ id: 1, firstname: 'John', lastname: 'Doe' }]);
                setTests([{ id: 1, test_name: 'Midterm Exam' }]);
            } else {
                setError('Failed to fetch results information.');
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

    const handleFileChange = (e) => {
        const { name, files: uploadedFiles } = e.target;
        setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const form = new FormData();
            form.append('student_id', formData.student_id);
            form.append('test_id', formData.test_id);

            if (files.test_results) form.append('test_results', files.test_results);
            if (files.marksheet) form.append('marksheet', files.marksheet);
            if (files.answersheet) form.append('answersheet', files.answersheet);

            form.append('obtained_marks', formData.obtained_marks);
            form.append('total_marks', formData.total_marks);

            if (currentResult) {
                await adminService.editResult(currentResult.id, form);
            } else {
                await adminService.addResult(form);
            }

            setIsModalOpen(false);
            fetchData();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Error processing request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ student_id: '', test_id: '', obtained_marks: '', total_marks: '' });
        setFiles({ test_results: null, marksheet: null, answersheet: null });
        setCurrentResult(null);
    };

    const handleEdit = (result) => {
        setCurrentResult(result);
        setFormData({
            student_id: result.student_id,
            test_id: result.test_id,
            obtained_marks: result.obtained_marks || '',
            total_marks: result.total_marks || ''
        });
        setFiles({ test_results: null, marksheet: null, answersheet: null });
        setIsModalOpen(true);
    };

    const handleDelete = async (result) => {
        if (window.confirm('Delete this result record?')) {
            try {
                await adminService.deleteResult(result.id);
                fetchData();
            } catch (err) {
                setError('Error deleting result');
            }
        }
    };

    const columns = [
        {
            header: 'Student',
            accessor: 'student_id',
            render: (val) => {
                const s = students.find(s => s.id === val);
                return s ? `${s.firstname} ${s.lastname}` : `ID: ${val}`;
            }
        },
        {
            header: 'Test',
            accessor: 'test_id',
            render: (val) => tests.find(t => t.id === val)?.test_name || `ID: ${val}`
        },
        {
            header: 'Uploaded On',
            accessor: 'created_at',
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            header: 'Files',
            accessor: 'id',
            render: (val, row) => (
                <div className="file-icons">
                    {row.test_results && <FileText size={16} title="Result" />}
                    {row.marksheet && <CheckCircle size={16} title="Marksheet" />}
                    {row.answersheet && <FileUp size={16} title="Answersheet" />}
                </div>
            )
        }
    ];

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Results Management</h1>
                    <p>Post test results and educational records</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        <Plus size={20} />
                        Post Result
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/admin/bulk-results')}
                    >
                        Bulk Result Upload
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
                            placeholder="Search by student or test..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={results}
                    isLoading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentResult ? 'Edit Result' : 'Post New Result'}
            >
                <form onSubmit={handleSubmit} className="management-form">
                    <CustomSelect
                        label="Student"
                        name="student_id"
                        value={formData.student_id}
                        options={students.map(s => ({ label: `${s.firstname} ${s.lastname}`, value: s.id }))}
                        onChange={handleInputChange}
                        placeholder="Select Student..."
                    />

                    <CustomSelect
                        label="Test / Examination"
                        name="test_id"
                        value={formData.test_id}
                        options={tests.map(t => ({ label: t.test_name, value: t.id }))}
                        onChange={handleInputChange}
                        placeholder="Select Test..."
                    />

                    <div className="form-row">
                        <div className="form-group">
                            <label>Obtained Marks</label>
                            <input
                                type="number"
                                name="obtained_marks"
                                value={formData.obtained_marks}
                                onChange={handleInputChange}
                                placeholder="Marks scored"
                            />
                        </div>
                        <div className="form-group">
                            <label>Total Marks</label>
                            <input
                                type="number"
                                name="total_marks"
                                value={formData.total_marks}
                                onChange={handleInputChange}
                                placeholder="Out of"
                            />
                        </div>
                    </div>

                    <div className="file-upload-section">
                        <div className="form-group">
                            <label>Test Results (PDF/Image)</label>
                            <input type="file" name="test_results" onChange={handleFileChange} />
                        </div>
                        <div className="form-group">
                            <label>Official Marksheet</label>
                            <input type="file" name="marksheet" onChange={handleFileChange} />
                        </div>
                        <div className="form-group">
                            <label>Student Answersheet</label>
                            <input type="file" name="answersheet" onChange={handleFileChange} />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-text" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Uploading...' : (currentResult ? 'Update Result' : 'Post Result')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ResultsManagement;
