const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");

module.exports = (app) => {

    app.get("/products", productController.getProducts);
    app.get("/cart/:id", cartController.getCart);
};