const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const facultySubject = sequelize.define('facultySubject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    faculty_to_branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ccs_faculty_to_branch',
            key: 'faculty_to_branch_id'
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
        tableName: 'ccs_faculty_subjects',
        timestamps: false,
    });

module.exports = facultySubject;