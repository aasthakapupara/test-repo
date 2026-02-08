const Branch = require("./branch");
const FacultyToBranch = require("./facultyToBranch");
const Class = require("./class");
const Course = require("./course");
const Subject = require("./subjects");
const StudentManagement = require("./studentManagement");
const StudentSubject = require("./studentSubjects");
const FacultySubject = require("./facultySubjects");
const StudentTest = require("./studentTests");
const StudentResult = require("./studentResults");
const User = require("../Admin/user");

// Associations
FacultyToBranch.belongsTo(User, { foreignKey: 'faculty_id', as: 'faculty' });
FacultyToBranch.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

StudentManagement.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
StudentManagement.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
StudentManagement.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
StudentManagement.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

StudentResult.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
StudentResult.belongsTo(StudentTest, { foreignKey: 'test_id', as: 'test' });

StudentTest.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
StudentTest.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
StudentTest.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
StudentTest.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

module.exports = {
    Branch, FacultyToBranch, Class, Course, Subject, StudentManagement, StudentSubject, FacultySubject, StudentResult, StudentTest
};