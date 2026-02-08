const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const Branch = sequelize.define('Branch', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    branch_name: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    branch_address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    branch_email: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    branch_contact_number: {
        type: DataTypes.STRING(254),
        allowNull: true,
    }
},
    {
        tableName: 'ccs_branch',
        timestamps: false,
    });

module.exports = Branch;