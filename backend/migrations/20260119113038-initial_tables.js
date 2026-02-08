'use strict';

const bcrypt = require('bcrypt');
const { currentDateForDB } = require('../helpers/helperFunctions');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ccs_users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstname: {
        type: Sequelize.STRING(254),
        allowNull: true,
      },
      lastname: {
        type: Sequelize.STRING(254),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: true,
      },
      mobile: {
        type: Sequelize.STRING(254),
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(254),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      role: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: '1 = superadmin, 2 = faculty, 3 = student',
      }
    });

    const passwordHash = await bcrypt.hash('SuperAdmin@123', 10);

    await queryInterface.bulkInsert('ccs_users', [{
      firstname: 'SuperAdmin1',
      lastname: 'super',
      email: 'Superadmin@gmail.com',
      mobile: '1111111111',
      password: passwordHash,
      created_at: currentDateForDB(),
      role: 1
    }], {});

    await queryInterface.createTable('ccs_branch', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      branch_name: {
        type: Sequelize.STRING(254),
        allowNull: true,
      },
      branch_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      branch_email: {
        type: Sequelize.STRING(254),
        allowNull: true,
      },
      branch_contact_number: {
        type: Sequelize.STRING(254),
        allowNull: true,
      }
    });

    await queryInterface.createTable('ccs_faculty_to_branch', {
      faculty_to_branch_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ccs_branch',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      faculty_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ccs_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: true,
        defaultValue: 'active',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ccs_faculty_to_branch');
    await queryInterface.dropTable('ccs_branch');
    await queryInterface.dropTable('ccs_users');
  }
};
