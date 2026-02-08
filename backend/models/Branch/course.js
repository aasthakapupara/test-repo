const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    course_name: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    course_slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: true,
        defaultValue: 'active',
    }
},
    {
        tableName: 'ccs_course',
        timestamps: false,
    });

module.exports = Course;