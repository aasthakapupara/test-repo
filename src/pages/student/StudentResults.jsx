import { useState, useEffect, useMemo } from 'react';
import { FileBarChart, Download, FileText, ExternalLink, Calendar, Search, Filter, ArrowUpDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import studentService from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';

const StudentResults = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState(null);

    // New filters
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [sortBy, setSortBy] = useState('date-desc'); // 'date-asc', 'date-desc', 'marks-asc', 'marks-desc'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resultsRes, testsRes] = await Promise.all([
                studentService.getMyResults(),
                studentService.getTests()
            ]);

            // Filter results for current student
            const myResults = resultsRes.data.content.filter(r => r.student_id === user.id);

            // Map test info to results
            const mappedResults = myResults.map(result => {
                const test = testsRes.data.content.find(t => t.id === result.test_id);
                return {
                    ...result,
                    test_name: test?.test_name || 'Unknown Test',
                    test_date: test?.test_date || 'N/A',
                    total_marks: test?.test_total_marks || 'N/A'
                };
            });

            setResults(mappedResults);
            setTests(testsRes.data.content);
        } catch (error) {
            console.error('Error fetching student results:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (path, name) => {
        if (!path) return;
        setStatus({ type: 'success', message: `${name} download started... (Simulated)` });
        setTimeout(() => setStatus(null), 3000);
    };

    const filteredAndSortedResults = useMemo(() => {
        let filtered = results.filter(r =>
            r.test_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Date range filtering
        if (startDate) {
            filtered = filtered.filter(r => {
                const testDate = new Date(r.test_date);
                return testDate >= startDate;
            });
        }
        if (endDate) {
            filtered = filtered.filter(r => {
                const testDate = new Date(r.test_date);
                return testDate <= endDate;
            });
        }

        // Sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.test_date) - new Date(b.test_date);
                case 'date-desc':
                    return new Date(b.test_date) - new Date(a.test_date);
                case 'marks-asc':
                    return (a.obtained_marks || 0) - (b.obtained_marks || 0);
                case 'marks-desc':
                    return (b.obtained_marks || 0) - (a.obtained_marks || 0);
                default:
                    return 0;
            }
        });

        return sorted;
    }, [results, searchTerm, startDate, endDate, sortBy]);

    const columns = [
        {
            accessor: 'test_name',
            header: 'Test Description',
            render: (val, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {row.test_date}
                    </div>
                </div>
            )
        },
        {
            accessor: 'obtained_marks',
            header: 'Score',
            render: (val, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{val || 'N/A'}</span>
                    <span className="text-dim">/ {row.total_marks}</span>
                </div>
            )
        },
        {
            accessor: 'documents',
            header: 'Documents',
            render: (_, row) => {
                const marksheets = row.marksheet ? JSON.parse(row.marksheet) : [];
                const answersheets = row.answersheet ? JSON.parse(row.answersheet) : [];

                return (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {marksheets.length > 0 && (
                            <button
                                className="btn btn-secondary btn-xs"
                                onClick={() => handleDownload(marksheets[0], 'Marksheet')}
                                title="Download Marksheet"
                            >
                                <FileText size={14} />
                                Result
                            </button>
                        )}
                        {answersheets.length > 0 && (
                            <button
                                className="btn btn-secondary btn-xs"
                                onClick={() => handleDownload(answersheets[0], 'Answersheet')}
                                title="Download Answersheet"
                            >
                                <Download size={14} />
                                Sheet
                            </button>
                        )}
                    </div>
                );
            }
        },
        {
            accessor: 'actions',
            header: 'Details',
            render: (_, row) => (
                <button className="btn btn-primary btn-sm" onClick={() => alert(`Showing details for ${row.test_name}`)}>
                    <ExternalLink size={14} />
                    View
                </button>
            )
        }
    ];

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>My Academic Performance</h1>
                    <p>View your test scores and download performance reports</p>
                </div>
            </div>

            <div className="content-card">
                <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div className="search-box" style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search by test name..."
                            style={{ width: '100%', paddingLeft: '3rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {status && (
                    <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
                        {status.message}
                    </div>
                )}

                <DataTable
                    columns={columns}
                    data={filteredAndSortedResults}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default StudentResults;
