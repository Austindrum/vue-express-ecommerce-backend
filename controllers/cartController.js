const db = require("../models");
const Cart = db.Cart;
const Product = db.Product;

let cartController = {
    getCart: (req, res) => {
        return Cart.findByPk(req.params.id, {
            include: [
                { model: Product, as: "items" }
            ]
        }).then(cart => {
            if(cart){
                res.status(200).json(cart.toJSON());
            }else{
                res.status(404).json({
                    message: "找不到購物車"
                })
            }
        }).catch(err => console.log(err))
    },
    postCart: (req, res) => {
        try {
            const cartId = req.session.cartId;
            const productInfo = { ...req.body };
            console.log(cartId, productInfo);
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = cartController;