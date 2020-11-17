const multer = require("multer");
const upload = multer({ dest: 'temp/' });


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
    //=== 使用者管理 ===
    app.post("/admin/signup", adminController.signup);
    app.post("/admin/signin", adminController.signin);

    app.use(checkIsLogin);
    app.get("/admin/order/:cartId", adminController.getOrder);
    app.post("/admin/order", adminController.postOrder);
    app.get("/get_current_user", userController.getCurrentUser);
    app.put("/admin/user/:id", upload.single('image'), adminController.putUser);
    app.get("/admin/:id/carts", adminController.getUserCarts);
    app.get("/admin/:userId/cart/:cartId", adminController.getUserCart);
    app.delete("/admin/:userId/cart/:cartId", adminController.deleteUserCart);
    app.get('/order/:id/payment', adminController.getPayment)
    app.post('/spgateway/callback', adminController.spgatewayCallback)
    //=== 購物車 ===
    app.post("/cart", cartController.postCart);


};