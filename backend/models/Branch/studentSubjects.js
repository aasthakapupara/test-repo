const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const StudentSubject = sequelize.define('StudentSubject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    student_management_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ccs_student_management',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ccs_subjects',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
},
    {
        tableName: 'ccs_student_subjects',
        timestamps: false,
    });

module.exports = StudentSubject;