'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "address", {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "tel", {
        type: Sequelize.STRING,
        allowNull: true
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "address"),
      queryInterface.removeColumn("Users", "tel")
    ])
  }
};
