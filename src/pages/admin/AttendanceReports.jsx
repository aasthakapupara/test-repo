import { useState, useEffect, useMemo } from 'react';
import { Calendar, Download, FileText, Filter, TrendingUp, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import { generateAttendancePDF, downloadPDF } from '../../utils/pdfGenerator';


const AttendanceReports = () => {
    const [attendance, setAttendance] = useState([]);
    const [branches, setBranches] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [selectedClass, setSelectedClass] = useState('all');
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('student'); // 'student' or 'class'

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (branches.length > 0) {
            fetchAttendance();
        }
    }, [selectedBranch, selectedClass, startDate, endDate]);

    const fetchInitialData = async () => {
        try {
            const [branchesRes, classesRes] = await Promise.all([
                adminService.getBranches(),
                adminService.getClasses()
            ]);
            setBranches(branchesRes.data.content || []);
            setClasses(classesRes.data.content || []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const params = {
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0]
            };

            const response = await adminService.getAttendance();
            // const records = response.data.content?.records || [];
            const records = (response.data.content?.data || []).filter(r => {
                const recordDate = new Date(r.date);
                return recordDate >= startDate && recordDate <= endDate;
            });


            // Enrich with student and branch info
            const [usersRes, assignmentsRes] = await Promise.all([
                adminService.getUsers(),
                adminService.getStudentAssignments()
            ]);

            const users = usersRes.data.content || [];
            const assignments = assignmentsRes.data.content || [];

            const enrichedRecords = records.map(record => {
                const student = users.find(u => u.id === record.user_id);
                //const assignment = assignments.find(a => a.user_id === record.user_id);
                const assignment = assignments.find(a =>
                    a.user_id === record.user_id ||
                    a.student_id === record.user_id ||
                    a.user?.id === record.user_id
                );

                //const branch = branches.find(b => b.id === assignment?.branch_id);
                const branch = branches.find(
                    b => b.id === assignment?.branch_id || b.id === assignment?.branchId
                );

                const classObj = classes.find(
                    c => c.id === assignment?.class_id || c.id === assignment?.classId
                );


                return {
                    ...record,
                    student_name: student ? `${student.firstname} ${student.lastname}` : 'Unknown',
                    student_email: student?.email || 'N/A',
                    branch_id: assignment?.branch_id,
                    branch_name: branch?.branch_name || 'N/A',
                    class_id: assignment?.class_id,
                    class_name: classes.find(c => c.id === assignment?.class_id)?.class_name || 'N/A'
                };
            });

            setAttendance(enrichedRecords);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter and aggregate data
    const filteredData = useMemo(() => {
        let filtered = attendance;

        if (selectedBranch !== 'all') {
            filtered = filtered.filter(r => r.branch_id === parseInt(selectedBranch));
        }

        if (selectedClass !== 'all') {
            filtered = filtered.filter(r => r.class_id === parseInt(selectedClass));
        }

        return filtered;
    }, [attendance, selectedBranch, selectedClass]);

    // Student-wise summary
    const studentSummary = useMemo(() => {
        const summary = {};

        filteredData.forEach(record => {
            if (!summary[record.user_id]) {
                summary[record.user_id] = {
                    user_id: record.user_id,
                    student_name: record.student_name,
                    student_email: record.student_email,
                    branch_name: record.branch_name,
                    class_name: record.class_name,
                    total: 0,
                    present: 0,
                    absent: 0
                };
            }

            summary[record.user_id].total++;
            if (record.status === 'present') {
                summary[record.user_id].present++;
            } else {
                summary[record.user_id].absent++;
            }
        });

        return Object.values(summary).map(s => ({
            ...s,
            percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) : 0
        }));
    }, [filteredData]);

    // Class-wise summary
    const classSummary = useMemo(() => {
        const summary = {};

        filteredData.forEach(record => {
            const key = `${record.class_id}_${record.branch_id}`;
            if (!summary[key]) {
                summary[key] = {
                    class_name: record.class_name,
                    branch_name: record.branch_name,
                    total_records: 0,
                    present: 0,
                    absent: 0,
                    unique_students: new Set()
                };
            }

            summary[key].total_records++;
            summary[key].unique_students.add(record.user_id);
            if (record.status === 'present') {
                summary[key].present++;
            } else {
                summary[key].absent++;
            }
        });

        return Object.values(summary).map(s => ({
            class_name: s.class_name,
            branch_name: s.branch_name,
            total_students: s.unique_students.size,
            total_records: s.total_records,
            present: s.present,
            absent: s.absent,
            percentage: s.total_records > 0 ? ((s.present / s.total_records) * 100).toFixed(2) : 0
        }));
    }, [filteredData]);

    const handleExportPDF = () => {
        const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        const branchName = selectedBranch === 'all' ? 'All Branches' : branches.find(b => b.id === parseInt(selectedBranch))?.branch_name;
        const className = selectedClass === 'all' ? 'All Classes' : classes.find(c => c.id === parseInt(selectedClass))?.class_name;

        const data = viewMode === 'student'
            ? studentSummary.map(s => ({
                student_name: s.student_name,
                date: `${s.present}/${s.total} days`,
                status: `${s.absent} absent`,
                percentage: s.percentage
            }))
            : classSummary.map(c => ({
                student_name: `${c.class_name} - ${c.branch_name}`,
                date: `${c.total_students} students`,
                status: `${c.present}/${c.total_records}`,
                percentage: c.percentage
            }));

        const doc = generateAttendancePDF({
            data,
            title: 'Attendance Report',
            dateRange,
            branchName,
            className
        });

        downloadPDF(doc, `attendance_report_${new Date().getTime()}.pdf`);
    };

    //excel
    const handleExportExcel = () => {
        const data =
            viewMode === 'student'
                ? studentSummary.map(s => ({
                    'Student Name': s.student_name,
                    Email: s.student_email,
                    Branch: s.branch_name,
                    Class: s.class_name,
                    'Total Days': s.total,
                    Present: s.present,
                    Absent: s.absent,
                    'Attendance %': s.percentage
                }))
                : classSummary.map(c => ({
                    Class: c.class_name,
                    Branch: c.branch_name,
                    'Total Students': c.total_students,
                    'Total Records': c.total_records,
                    Present: c.present,
                    Absent: c.absent,
                    'Attendance %': c.percentage
                }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            viewMode === 'student' ? 'Student Attendance' : 'Class Attendance'
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array'
        });

        const blob = new Blob([excelBuffer], {
            type:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        saveAs(blob, `attendance_report_${Date.now()}.xlsx`);
    };


    const studentColumns = [
        {
            accessor: 'student_name',
            header: 'Student Name',
            render: (val, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{row.student_email}</div>
                </div>
            )
        },
        { accessor: 'branch_name', header: 'Branch' },
        { accessor: 'class_name', header: 'Class' },
        { accessor: 'total', header: 'Total Days' },
        { accessor: 'present', header: 'Present', render: (val) => <span style={{ color: 'var(--success)' }}>{val}</span> },
        { accessor: 'absent', header: 'Absent', render: (val) => <span style={{ color: 'var(--error)' }}>{val}</span> },
        {
            accessor: 'percentage',
            header: 'Attendance(%)',
            render: (val) => (
                <span style={{
                    fontWeight: 600,
                    color: val >= 75 ? 'var(--success)' : val >= 50 ? 'var(--warning)' : 'var(--error)'
                }}>
                    {val}%
                </span>
            )
        }
    ];

    const classColumns = [
        { accessor: 'class_name', header: 'Class' },
        { accessor: 'branch_name', header: 'Branch' },
        { accessor: 'total_students', header: 'Students' },
        { accessor: 'total_records', header: 'Total Records' },
        { accessor: 'present', header: 'Present', render: (val) => <span style={{ color: 'var(--success)' }}>{val}</span> },
        { accessor: 'absent', header: 'Absent', render: (val) => <span style={{ color: 'var(--error)' }}>{val}</span> },
        {
            accessor: 'percentage',
            header: 'Attendance(%)',
            render: (val) => (
                <span style={{
                    fontWeight: 600,
                    color: val >= 75 ? 'var(--success)' : val >= 50 ? 'var(--warning)' : 'var(--error)'
                }}>
                    {val}%
                </span>
            )
        }
    ];

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Attendance Reports</h1>
                    <p>Comprehensive attendance analysis with filtering and export</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={handleExportExcel}>
                        <Download size={20} />
                        Export Excel
                    </button>
                    <button className="btn btn-primary" onClick={handleExportPDF}>
                        <FileText size={20} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                <div className="stat-card" style={{ '--accent-color': 'var(--primary)' }}>
                    <div className="stat-icon"><Users /></div>
                    <div className="stat-info">
                        <h3>{viewMode === 'student' ? studentSummary.length : classSummary.length}</h3>
                        <p>{viewMode === 'student' ? 'Total Students' : 'Total Classes'}</p>
                    </div>
                </div>
                <div className="stat-card" style={{ '--accent-color': 'var(--success)' }}>
                    <div className="stat-icon"><TrendingUp /></div>
                    <div className="stat-info">
                        <h3>
                            {viewMode === 'student'
                                ? studentSummary.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / (studentSummary.length || 1)
                                : classSummary.reduce((sum, c) => sum + parseFloat(c.percentage), 0) / (classSummary.length || 1)
                            }%
                        </h3>
                        <p>Average Attendance</p>
                    </div>
                </div>
            </div>

            <div className="content-card">
                {/* Filters */}
                <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label><Calendar size={16} /> Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            dateFormat="yyyy-MM-dd"
                            className="date-picker-input"
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label><Calendar size={16} /> End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={setEndDate}
                            dateFormat="yyyy-MM-dd"
                            className="date-picker-input"
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                        <label><Filter size={16} /> Branch</label>
                        <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                            <option value="all">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                        <label><Filter size={16} /> Class</label>
                        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            <option value="all">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                        </select>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${viewMode === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('student')}
                    >
                        Student-wise
                    </button>
                    <button
                        className={`btn ${viewMode === 'class' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('class')}
                    >
                        Class-wise
                    </button>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={viewMode === 'student' ? studentColumns : classColumns}
                    data={viewMode === 'student' ? studentSummary : classSummary}
                    loading={loading}
                    showActions={false}
                />
            </div>
        </div>
    );
};

export default AttendanceReports;
