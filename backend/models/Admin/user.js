const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstname: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    lastname: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    mobile: {
        type: DataTypes.STRING(254),
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING(254),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    role: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: '1 = superadmin, 2 = faculty, 3 = student',
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: true,
        defaultValue: 'active',
    }
},
    {
        tableName: 'ccs_users',
        timestamps: false,
    });

module.exports = User;