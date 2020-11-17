'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Carts", "ordered", {
      type: Sequelize.BOOLEAN,
      allowNull: false
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Carts", "ordered")
  }
};
