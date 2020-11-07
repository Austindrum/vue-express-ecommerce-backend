const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController");

const authorization = require("../config/authorization");
const checkIsLogin = (req, res, next) => {
    return authorization.checkIsLogin(req, res, next);
}


module.exports = (app) => {
    //=== 商品 ===
    app.get("/products", productController.getProducts);
    //=== 購物車 ===
    app.get("/cart/:id", cartController.getCart);
    app.post("/cart", cartController.postCart);
    //=== 使用者管理 ===
    app.post("/admin/signup", adminController.signup);
    app.post("/admin/signin", adminController.signin);

    app.use(checkIsLogin);
    app.get("/get_current_user", userController.getCurrentUser);

};