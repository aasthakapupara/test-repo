const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    subject_name: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    subject_slug: {
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
        tableName: 'ccs_subjects',
        timestamps: false,
    });

module.exports = Subject;