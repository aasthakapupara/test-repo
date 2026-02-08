const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const FacultyToBranch = sequelize.define('FacultyToBranch', {
    faculty_to_branch_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ccs_branch',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ccs_users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: true,
        defaultValue: 'active',
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
},
    {
        tableName: 'ccs_faculty_to_branch',
        timestamps: false,
    });

module.exports = FacultyToBranch;