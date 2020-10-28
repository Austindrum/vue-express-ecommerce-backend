'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsToMany(models.Cart, {
        as: "carts",
        through: { model: models.CartItem, unique: false },
        foreignKey: "ProductId"
      });
      Product.belongsToMany(models.Order, {
        as: "orders",
        through: { model: models.Order, unique: false },
        foreignKey: "ProductId"
      })
    }
  };
  Product.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};