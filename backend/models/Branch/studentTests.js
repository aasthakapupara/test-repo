const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const StudentTest = sequelize.define('StudentTest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    test_name: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ccs_class',
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
    }
},
    {
        tableName: 'ccs_tests',
        timestamps: false,
    });

module.exports = StudentTest;