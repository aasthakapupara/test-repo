// Temporary debug file to check subject assignment data
// Add this to FacultyManagement.jsx temporarily

const getAssignedSubjects = (facultyId) => {
    // Get all branch assignments for this faculty
    const facultyBranchAssignments = assignments.filter(a => a.faculty_id === facultyId);

    // Debug - only log for first faculty
    if (facultyId === faculty[0]?.id) {
        console.log('=== DEBUG: Subject Assignment ===');
        console.log('Faculty ID:', facultyId);
        console.log('Branch Assignments:', JSON.stringify(facultyBranchAssignments, null, 2));
        console.log('All Subject Assignments:', JSON.stringify(subjectAssignments, null, 2));
        console.log('All Subjects:', JSON.stringify(subjects, null, 2));

        // Check what IDs we're comparing
        facultyBranchAssignments.forEach(fba => {
            console.log('Branch Assignment ID:', fba.faculty_to_branch_id || fba.id);
        });

        subjectAssignments.forEach(sa => {
            console.log('Subject Assignment faculty_to_branch_id:', sa.faculty_to_branch_id);
        });
    }

    // Get subject assignments for these branch assignments
    const facultySubjects = subjectAssignments
        .filter(sa => {
            const branchAssignment = facultyBranchAssignments.find(
                fba => (fba.faculty_to_branch_id || fba.id) === sa.faculty_to_branch_id
            );
            return branchAssignment !== undefined;
        })
        .map(sa => {
            const subject = subjects.find(s => s.id === sa.subject_id);
            return subject ? subject.subject_name : null;
        })
        .filter(Boolean);

    // Remove duplicates and join
    const result = [...new Set(facultySubjects)].join(', ') || 'Not assigned';

    if (facultyId === faculty[0]?.id) {
        console.log('Final result:', result);
        console.log('=== END DEBUG ===');
    }

    return result;
};
