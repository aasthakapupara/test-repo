import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, User, GraduationCap, ClipboardList, Info } from 'lucide-react';
import facultyService from '../../services/facultyService';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const ResultsUpload = () => {
    const { user: facultyUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        student_id: '',
        test_id: '',
        obtained_marks: '',
        total_marks: '',
        test_results: null,
        marksheet: null,
        answersheet: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, assignmentsRes, testsRes, myAssignmentsRes] = await Promise.all([
                facultyService.getUsers(),
                adminService.getStudentAssignments(),
                facultyService.getTests(),
                facultyService.getMyAssignments()
            ]);

            // Filter students in faculty's assigned branches
            const myBranchIds = myAssignmentsRes.data.content
                .filter(a => a.faculty_id === facultyUser.id)
                .map(a => a.branch_id);

            const myStudentAssignments = assignmentsRes.data.content.filter(a => myBranchIds.includes(a.branch_id));
            const myStudentIds = myStudentAssignments.map(a => a.user_id);

            const facultyStudents = usersRes.data.content
                .filter(u => u.role === 3 && myStudentIds.includes(u.id));

            setStudents(facultyStudents);
            setTests(testsRes.data.content);
        } catch (error) {
            console.error('Error fetching data for results upload:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, field) => {
        setFormData({
            ...formData,
            [field]: e.target.files[0]
        });
        setStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.student_id || !formData.test_id) {
            setStatus({ type: 'error', message: 'Please select both a student and a test.' });
            return;
        }

        const data = new FormData();
        data.append('student_id', formData.student_id);
        data.append('test_id', formData.test_id);
        data.append('obtained_marks', formData.obtained_marks);
        data.append('total_marks', formData.total_marks);

        if (formData.test_results) data.append('test_results', formData.test_results);
        if (formData.marksheet) data.append('marksheet', formData.marksheet);
        if (formData.answersheet) data.append('answersheet', formData.answersheet);

        try {
            setLoading(true);
            await facultyService.uploadResults(data);
            setStatus({ type: 'success', message: 'Result documents uploaded successfully!' });
            setFormData({
                student_id: '',
                test_id: '',
                obtained_marks: '',
                total_marks: '',
                test_results: null,
                marksheet: null,
                answersheet: null
            });
            // Reset file inputs
            document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to upload results.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Post Student Results</h1>
                    <p>Upload marksheets and answer sheets for conducted tests</p>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2>Result Entry Form</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label><User size={16} /> Select Student</label>
                            <select
                                value={formData.student_id}
                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                required
                            >
                                <option value="">Select a student...</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.firstname} {s.lastname} ({s.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><GraduationCap size={16} /> Select Test</label>
                            <select
                                value={formData.test_id}
                                onChange={(e) => setFormData({ ...formData, test_id: e.target.value })}
                                required
                            >
                                <option value="">Select a test...</option>
                                {tests.map(t => (
                                    <option key={t.id} value={t.id}>{t.test_name} - {t.test_date}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Obtained Marks</label>
                            <input
                                type="number"
                                value={formData.obtained_marks}
                                onChange={(e) => setFormData({ ...formData, obtained_marks: e.target.value })}
                                placeholder="Enter marks scored"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Total Marks</label>
                            <input
                                type="number"
                                value={formData.total_marks}
                                onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                                placeholder="Out of marks"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                        {/* Test Results File */}
                        <div className="file-upload-box" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '1rem', background: 'var(--bg-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <ClipboardList size={20} className="text-primary" />
                                <h4 style={{ margin: 0 }}>Test Results</h4>
                            </div>
                            <input
                                type="file"
                                id="test_results"
                                onChange={(e) => handleFileChange(e, 'test_results')}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="test_results" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                                <Upload size={16} />
                                {formData.test_results ? formData.test_results.name : 'Upload Results File'}
                            </label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>PDF, Docx or Images supported</p>
                        </div>

                        {/* Marksheet File */}
                        <div className="file-upload-box" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '1rem', background: 'var(--bg-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <FileText size={20} className="text-secondary" />
                                <h4 style={{ margin: 0 }}>Marksheet</h4>
                            </div>
                            <input
                                type="file"
                                id="marksheet"
                                onChange={(e) => handleFileChange(e, 'marksheet')}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="marksheet" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                                <Upload size={16} />
                                {formData.marksheet ? formData.marksheet.name : 'Upload Marksheet'}
                            </label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Official signed marksheet</p>
                        </div>

                        {/* Answersheet File */}
                        <div className="file-upload-box" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '1rem', background: 'var(--bg-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <GraduationCap size={20} className="text-warning" />
                                <h4 style={{ margin: 0 }}>Answer Sheet</h4>
                            </div>
                            <input
                                type="file"
                                id="answersheet"
                                onChange={(e) => handleFileChange(e, 'answersheet')}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="answersheet" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                                <Upload size={16} />
                                {formData.answersheet ? formData.answersheet.name : 'Upload Answer Sheet'}
                            </label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Scanned copy of student answers</p>
                        </div>
                    </div>

                    {status && (
                        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '2rem' }}>
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {status.message}
                        </div>
                    )}

                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'Processing...' : 'Post Results & Update Records'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResultsUpload;
