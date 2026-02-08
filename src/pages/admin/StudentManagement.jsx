import { useState, useEffect } from 'react';
import { Plus, Search, User, Mail, Phone, Upload, AlertCircle, FileText } from 'lucide-react';
import adminService from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import CustomSelect from '../../components/common/CustomSelect';
import * as XLSX from 'xlsx';


const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    //const [studentSubjectCache, setStudentSubjectCache] = useState({});
    const [studentSubjectCache, setStudentSubjectCache] = useState(() => {
        try {
            const stored = localStorage.getItem("studentSubjectCache");
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });



    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        mobile: '',
        password: '',
        role: 3,
        branch_id: '',
        class_id: '',
        course_id: '',
        subject_ids: []
    });

    const [branches, setBranches] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, branchRes, classRes, courseRes, subjectRes, assignmentRes] = await Promise.all([
                adminService.getUsers(),
                adminService.getBranches(),
                adminService.getClasses(),
                adminService.getCourses(),
                adminService.getSubjects(),
                adminService.getStudentAssignments()
            ]);

            const allUsers = usersRes.data.content || [];
            setStudents(allUsers.filter(user => user.role === 3));
            setBranches(branchRes.data.content || []);
            setClasses(classRes.data.content || []);
            setCourses(courseRes.data.content || []);
            setSubjects(subjectRes.data.content || []);
            setAssignments(assignmentRes.data.content || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching students data:', err);
            setError('Failed to fetch data properly.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "studentSubjectCache",
            JSON.stringify(studentSubjectCache)
        );
    }, [studentSubjectCache]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let studentId;
            if (currentStudent) {
                studentId = currentStudent.id;
                await adminService.editUser(studentId, formData);
                await adminService.editStudentAssignment(studentId, {
                    branch_id: formData.branch_id,
                    class_id: formData.class_id,
                    course_id: formData.course_id,
                    subject_ids: formData.subject_ids
                });
                setStudentSubjectCache(prev => ({
                    ...prev,
                    [studentId]: formData.subject_ids
                }));
            } else {
                const userResponse = await adminService.addUser(formData);
                // Note: addUser response should return the new user id
                // If it doesn't, we might need to fetch it or modify the backend
                // Testing with assumed response structure
                studentId = userResponse.data.content?.id;

                if (studentId) {
                    await adminService.assignStudent({
                        student_id: studentId,
                        branch_id: formData.branch_id,
                        class_id: formData.class_id,
                        course_id: formData.course_id,
                        subject_ids: formData.subject_ids
                    });
                    setStudentSubjectCache(prev => ({
                        ...prev,
                        [studentId]: formData.subject_ids
                    }));
                }
            }
            setIsModalOpen(false);
            fetchData();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving student');
        }
    };

    const handleEdit = (student) => {
        const assignment = assignments.find(a => a.student_id === student.id);
        setCurrentStudent(student);
        setFormData({
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            mobile: student.mobile,
            password: '',
            role: 3,
            branch_id: assignment?.branch_id || '',
            class_id: assignment?.class_id || '',
            course_id: assignment?.course_id || '',
            subject_ids: studentSubjectCache[student.id] || [] // Subjects would need a separate link table fetch
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (student) => {
        if (window.confirm(`Are you sure you want to delete ${student.firstname}?`)) {
            try {
                await adminService.deleteUser(student.id);
                fetchData();
            } catch (err) {
                setError('Error deleting student');
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
            role: 3,
            branch_id: '',
            class_id: '',
            course_id: '',
            subject_ids: []
        });
        setCurrentStudent(null);
        setBulkFile(null);
    };

    const handleFileChange = (e) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];

        const allowedTypes = [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a CSV or Excel (.xlsx, .xls) file');
            setBulkFile(null);
            return;
        }

        setError(null);
        setBulkFile(file);
    };


    const handleDownloadTemplate = (e) => {
        e.preventDefault();
        const csvContent = "data:text/csv;charset=utf-8,"
            + "firstname,lastname,email,mobile,password,role,branch_id,class_id,course_id\n"
            + "John,Doe,john@example.com,9876543210,Pass@123,3,1,1,1";

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // const handleBulkUpload = async () => {
    //     if (!bulkFile) {
    //         setError('Please select a CSV or Excel (.xlsx, .xls) file first.');
    //         return;
    //     }

    //     try {
    //         setIsUploading(true);
    //         const formData = new FormData();
    //         formData.append('file', bulkFile);

    //         await adminService.bulkUploadStudents(formData);

    //         setIsBulkModalOpen(false);
    //         fetchData();
    //         setBulkFile(null);
    //         alert('Bulk upload processed successfully!');
    //     } catch (err) {
    //         console.error(err);
    //         setError(err.response?.data?.message || 'Error processing bulk upload');
    //     } finally {
    //         setIsUploading(false);
    //     }
    // };

    const handleBulkUpload = async () => {
        if (!bulkFile) {
            setError('Please select a CSV or Excel file first.');
            return;
        }

        try {
            setIsUploading(true);

            let uploadFile = bulkFile;

            // 🔥 If Excel → convert to CSV
            if (
                bulkFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                bulkFile.type === 'application/vnd.ms-excel'
            ) {
                const data = await bulkFile.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];

                const csvData = XLSX.utils.sheet_to_csv(sheet);
                uploadFile = new File(
                    [csvData],
                    bulkFile.name.replace(/\.(xlsx|xls)$/i, '.csv'),
                    { type: 'text/csv' }
                );
            }

            const formData = new FormData();
            formData.append('file', uploadFile);

            await adminService.bulkUploadStudents(formData);

            setIsBulkModalOpen(false);
            fetchData();
            setBulkFile(null);
            alert('Bulk upload processed successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error processing bulk upload');
        } finally {
            setIsUploading(false);
        }
    };


    const columns = [
        {
            header: 'Name',
            accessor: 'firstname',
            render: (_, row) => `${row.firstname} ${row.lastname}`
        },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Branch',
            accessor: 'id',
            render: (id) => {
                const a = assignments.find(a => a.student_id === id);
                return branches.find(b => b.id === a?.branch_id)?.branch_name || '-';
            }
        },
        {
            header: 'Class',
            accessor: 'id',
            render: (id) => {
                const a = assignments.find(a => a.student_id === id);
                return classes.find(c => c.id === a?.class_id)?.class_name || '-';
            }
        },
        {
            header: 'Course',
            accessor: 'id',
            render: (id) => {
                const a = assignments.find(a => a.student_id === id);
                return courses.find(c => c.id === a?.course_id)?.course_name || '-';
            }
        },
        {
            header: 'Subjects',
            accessor: 'id',
            render: (id) => {
                const subjectIds = studentSubjectCache[id];

                if (!subjectIds || subjectIds.length === 0) {
                    return '-';
                }

                return subjectIds
                    .map(subId =>
                        subjects.find(s => s.id === subId)?.subject_name
                    )
                    .filter(Boolean)
                    .join(', ');
            }
        }

        // {
        //     header: 'Status',
        //     accessor: 'status',
        //     render: () => <span className="status-badge active">Active</span>
        // }
    ];

    const filteredStudents = students.filter(student =>
        `${student.firstname} ${student.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Student Management</h1>
                    <p>Manage student profiles and enrollment</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsBulkModalOpen(true)}
                    >
                        <Upload size={20} />
                        Bulk Upload
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                    >
                        <Plus size={20} />
                        Add Student
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
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredStudents}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={loading}
                />
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentStudent ? 'Edit Student' : 'Add New Student'}
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
                                placeholder="Enter first name"
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
                                placeholder="Enter last name"
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
                            placeholder="student@example.com"
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
                            placeholder="10-digit mobile number"
                        />
                    </div>
                    {!currentStudent && (
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                placeholder="Set initial password"
                            />
                        </div>
                    )}

                    <div className="form-divider">Enrollment Details</div>

                    <CustomSelect
                        label="Branch"
                        name="branch_id"
                        value={formData.branch_id}
                        options={branches.map(b => ({ label: b.branch_name, value: b.id }))}
                        onChange={handleInputChange}
                        placeholder="Select Branch..."
                    />

                    <div className="form-row">
                        <CustomSelect
                            label="Class"
                            name="class_id"
                            value={formData.class_id}
                            options={classes.map(c => ({ label: c.class_name, value: c.id }))}
                            onChange={handleInputChange}
                            placeholder="Select Class (9th, 10th...)"
                        />
                        <CustomSelect
                            label="Course"
                            name="course_id"
                            value={formData.course_id}
                            options={courses.map(c => ({ label: c.course_name, value: c.id }))}
                            onChange={handleInputChange}
                            placeholder="Select Course (NEET, JEE...)"
                        />
                    </div>

                    <CustomSelect
                        label="Assigned Subjects"
                        name="subject_ids"
                        value={formData.subject_ids}
                        options={subjects.map(s => ({ label: s.subject_name, value: s.id }))}
                        onChange={handleInputChange}
                        placeholder="Select one or more subjects..."
                        isMulti={true}
                    />
                    <div className="modal-footer">
                        <button type="button" className="btn btn-text" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {currentStudent ? 'Update Student' : 'Save Student'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Bulk Student Upload"
            >
                <div className="bulk-upload-container">
                    <div className="upload-info">
                        <FileText size={48} />
                        <p>Upload a CSV file containing student details.</p>
                        <button className="btn-link download-link" onClick={handleDownloadTemplate}>
                            Download Template
                        </button>
                    </div>
                    <div className="file-drop-zone">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                        <p>{bulkFile ? bulkFile.name : "Drag and drop your file here or click to browse"}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-text" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleBulkUpload}
                            disabled={!bulkFile || isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Start Upload'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentManagement;
