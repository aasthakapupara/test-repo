const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const StudentResult = sequelize.define('StudentResult', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ccs_users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ccs_tests',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    test_results: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    marksheet: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    answersheet: {
        type: DataTypes.STRING(254),
        allowNull: true,
    }
},
    {
        tableName: 'ccs_student_result',
        timestamps: false,
    });

module.exports = StudentResult;