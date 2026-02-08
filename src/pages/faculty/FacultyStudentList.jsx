import { useState, useEffect, useMemo } from 'react';
import { Users, Search, Filter, Mail, Phone, ExternalLink, Download } from 'lucide-react';
import facultyService from '../../services/facultyService';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';

const FacultyStudentList = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, assignmentsRes, branchesRes, myAssignmentsRes] = await Promise.all([
                facultyService.getUsers(),
                adminService.getStudentAssignments(), // Using adminService for now as it's common
                adminService.getBranches(),
                facultyService.getMyAssignments()
            ]);

            // Filter students (role 3)
            const allStudents = usersRes.data.content.filter(u => u.role === 3);

            // Get branches assigned to this faculty
            const myBranchIds = myAssignmentsRes.data.content
                .filter(a => a.faculty_id === user.id)
                .map(a => a.branch_id);

            // Filter student-branch assignments for my branches
            const myStudentAssignments = assignmentsRes.data.content.filter(a => myBranchIds.includes(a.branch_id));
            const myStudentIds = myStudentAssignments.map(a => a.user_id);

            // Final list of students with branch info
            const facultyStudents = allStudents
                .filter(s => myStudentIds.includes(s.id))
                .map(s => {
                    const assignment = myStudentAssignments.find(a => a.user_id === s.id);
                    const branch = branchesRes.data.content.find(b => b.id === assignment?.branch_id);
                    return {
                        ...s,
                        branch_name: branch?.branch_name || 'N/A'
                    };
                });

            setStudents(facultyStudents);
            setAssignments(myStudentAssignments);
            setBranches(branchesRes.data.content.filter(b => myBranchIds.includes(b.id)));
        } catch (error) {
            console.error('Error fetching faculty students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                `${student.firstname} ${student.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBranch = selectedBranch === 'all' || student.branch_name === selectedBranch;
            return matchesSearch && matchesBranch;
        });
    }, [students, searchTerm, selectedBranch]);

    const columns = [
        {
            accessor: 'name',
            header: 'Student Name',
            render: (_, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                        {row.firstname.charAt(0)}{row.lastname.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{row.firstname} {row.lastname}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: #{row.id}</div>
                    </div>
                </div>
            )
        },
        {
            accessor: 'branch_name',
            header: 'Branch',
            render: (val) => (
                <span className="badge badge-primary">{val}</span>
            )
        },
        {
            accessor: 'contact',
            header: 'Contact Info',
            render: (_, row) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Mail size={14} className="text-dim" />
                        {row.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Phone size={14} className="text-dim" />
                        {row.mobile}
                    </div>
                </div>
            )
        },
        {
            accessor: 'actions',
            header: 'Actions',
            render: (_, row) => (
                <button className="btn btn-secondary btn-sm" onClick={() => alert(`Viewing profile for ${row.firstname}`)}>
                    <ExternalLink size={16} />
                    View Profile
                </button>
            )
        }
    ];

    return (
        <div className="management-page">
            <div className="page-header">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + "Name,Branch,Email,Mobile\n"
                                + students.map(s => `${s.firstname} ${s.lastname},${s.branch_name},${s.email},${s.mobile}`).join("\n");
                            const link = document.createElement("a");
                            link.setAttribute("href", encodeURI(csvContent));
                            link.setAttribute("download", "student_list.csv");
                            document.body.appendChild(link);
                            link.click();
                        }}
                    >
                        <Download size={20} />
                        Export List
                    </button>
                </div>
            </div>

            <div className="content-card">
                <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="search-box" style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            style={{ width: '100%', paddingLeft: '3rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={20} className="text-dim" />
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                style={{ minWidth: '180px' }}
                            >
                                <option value="all">All Branches</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.branch_name}>{b.branch_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredStudents}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default FacultyStudentList;
