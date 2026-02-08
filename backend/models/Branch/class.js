const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const Class = sequelize.define('Class', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    class_name: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    class_slug: {
        type: DataTypes.STRING(100),
        allowNull: true,
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
        tableName: 'ccs_class',
        timestamps: false,
    });

module.exports = Class;