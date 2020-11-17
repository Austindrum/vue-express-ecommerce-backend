const db = require("../models");
const Cart = db.Cart;
const Product = db.Product;
const CartItem = db.CartItem;

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
    postCart: async (req, res) => {
        try {
            const items = req.body.cart;
            const userId = req.body.user.id;
            const newCart = await Cart.create({
                UserId: userId,
                ordered: false
            });
            await items.forEach(item => {
                CartItem.create({
                    CartId: newCart.id,
                    ProductId: item.product.id,
                    quantity: item.quantity,
                    UserId: userId
                })
            });
            return res.json({
                status: "success",
                message: "Cart Create Success"
            })
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = cartController;