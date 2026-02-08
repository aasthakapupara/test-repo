const Attendance = require("./attendance");
const User = require("../Admin/user");
const { Branch, Class, Course, Subject } = require("../Branch");

Attendance.belongsTo(User, { foreignKey: 'user_id', as: 'student' });
Attendance.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Attendance.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Attendance.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Attendance.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

module.exports = { Attendance };