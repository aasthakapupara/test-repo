import { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';
import adminService from '../../services/adminService';
import { useFileSelection } from '../../hooks/useFileSelection';

const BulkResultUpload = () => {
    const [uploadStatus, setUploadStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const {
        file,
        error: fileError,
        handleFileChange,
        clearFile
    } = useFileSelection(['.csv']);

    const handleDownloadTemplate = () => {
        const csvContent = "Student Email,Test Name,Test Date (YYYY-MM-DD),Marks Obtained,Total Marks\nstudent@example.com,Mid-Term Exam,2024-01-15,85,100";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_results_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleFileSelect = async (selectedFile) => {
        handleFileChange(selectedFile);

        // Parse CSV for preview
        if (selectedFile) {
            const text = await selectedFile.text();
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',');
            const rows = lines.slice(1, 6).map(line => line.split(','));

            setPreview({
                headers,
                rows,
                totalRows: lines.length - 1
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        try {
            setLoading(true);
            setUploadStatus(null);

            // Parse CSV file
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());

            // Validate headers
            const expectedHeaders = ['Student Email', 'Test Name', 'Test Date (YYYY-MM-DD)', 'Marks Obtained', 'Total Marks'];
            const headersValid = expectedHeaders.every((h, i) => headers[i] === h);

            if (!headersValid) {
                setUploadStatus({
                    type: 'error',
                    message: 'Invalid CSV format. Please use the template provided.'
                });
                setLoading(false);
                return;
            }

            let inserted = 0;
            let skipped = 0;
            const errors = [];

            // Process each row
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',').map(cell => cell.trim());

                if (row.length < 5) {
                    skipped++;
                    errors.push(`Row ${i + 1}: Incomplete data`);
                    continue;
                }

                const [email, testName, testDate, marksObtained, totalMarks] = row;

                try {
                    // Create FormData for each result
                    const formData = new FormData();
                    formData.append('student_email', email);
                    formData.append('test_name', testName);
                    formData.append('test_date', testDate);
                    formData.append('marks_obtained', marksObtained);
                    formData.append('total_marks', totalMarks);

                    await adminService.addResult(formData);
                    inserted++;
                } catch (error) {
                    skipped++;
                    errors.push(`Row ${i + 1} (${email}): ${error.response?.data?.message || 'Failed to add'}`);
                }
            }

            setUploadStatus({
                type: inserted > 0 ? 'success' : 'error',
                message: `Processed ${inserted + skipped} rows. ${inserted} successful, ${skipped} failed.`,
                details: { inserted, skipped, errors }
            });

            if (inserted > 0) {
                clearFile();
                setPreview(null);
            }
        } catch (error) {
            setUploadStatus({
                type: 'error',
                message: error.message || 'Failed to upload results. Please check the file format.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Bulk Result Upload</h1>
                    <p>Upload multiple test results via CSV file</p>
                </div>
                <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
                    <Download size={20} />
                    Download Template
                </button>
            </div>

            <div className="content-card">
                <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={20} />
                        <div>
                            <strong>CSV Format:</strong> Student Email, Test Name, Test Date (YYYY-MM-DD), Marks Obtained, Total Marks
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '4rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', textAlign: 'center', marginBottom: '2rem' }}>
                        <input
                            type="file"
                            id="csv-file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                        />
                        <label htmlFor="csv-file" style={{ cursor: 'pointer' }}>
                            <Upload size={48} className="text-primary" style={{ marginBottom: '1rem' }} />
                            <h3>{file ? file.name : 'Select CSV File'}</h3>
                            <p className="text-dim">Click to browse or drag and drop</p>
                        </label>
                    </div>

                    {fileError && (
                        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                            <AlertCircle size={20} />
                            {fileError}
                        </div>
                    )}

                    {preview && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={20} />
                                Preview ({preview.totalRows} rows)
                            </h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {preview.headers.map((header, i) => (
                                                <th key={i}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.map((row, i) => (
                                            <tr key={i}>
                                                {row.map((cell, j) => (
                                                    <td key={j}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {preview.totalRows > 5 && (
                                <p className="text-dim" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                    Showing first 5 rows of {preview.totalRows}
                                </p>
                            )}
                        </div>
                    )}

                    {uploadStatus && (
                        <div className={`alert ${uploadStatus.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
                            {uploadStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <div>
                                <strong>{uploadStatus.message}</strong>
                                {uploadStatus.details && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                        <div>Inserted: {uploadStatus.details.inserted}</div>
                                        <div>Skipped: {uploadStatus.details.skipped}</div>
                                        {uploadStatus.details.errors && uploadStatus.details.errors.length > 0 && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <strong>Errors:</strong>
                                                <ul style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                                                    {uploadStatus.details.errors.slice(0, 5).map((err, i) => (
                                                        <li key={i}>{err}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!file || loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Processing...' : 'Upload Results'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BulkResultUpload;
