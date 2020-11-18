const crypto = require("crypto");
const db = require("../models");
const User = db.User;
const Cart = db.Cart;
const Product = db.Product;
const CartItem = db.CartItem;
const Order = db.Order;
const OrderItem = db.OrderItem;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const imgur = require('imgur-node-api');
const IMGUR_ID = process.env.IMGUR_ID;

const URL = 'https://intense-caverns-74208.herokuapp.com'
const MerchantID = process.env.MerchantID;
const HashKey = process.env.HashKey;
const HashIV = process.env.HashIV;
const PayGateWay = "https://ccore.spgateway.com/MPG/mpg_gateway"
const ReturnURL = URL+"/spgateway/callback?from=ReturnURL"
const NotifyURL = URL+"/spgateway/callback?from=NotifyURL"
const ClientBackURL = "http://localhost:8080/#/products"

function genDataChain(TradeInfo) {
    let results = [];
    for (let kv of Object.entries(TradeInfo)) {
        results.push(`${kv[0]}=${kv[1]}`);
    }
    return results.join("&");
}
function create_mpg_aes_encrypt(TradeInfo) {
    let encrypt = crypto.createCipheriv("aes256", HashKey, HashIV);
    let enc = encrypt.update(genDataChain(TradeInfo), "utf8", "hex");
    return enc + encrypt.final("hex");
}

function create_mpg_sha_encrypt(TradeInfo) {

    let sha = crypto.createHash("sha256");
    let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`

    return sha.update(plainText).digest("hex").toUpperCase();
}

function getTradeInfo(Amt, Desc, email){

    // console.log('===== getTradeInfo =====')
    // console.log(Amt, Desc, email)
    // console.log('==========')
  
    data = {
        'MerchantID': MerchantID, // 商店代號
        'RespondType': 'JSON', // 回傳格式
        'TimeStamp': Date.now(), // 時間戳記
        'Version': 1.5, // 串接程式版本
        'MerchantOrderNo': Date.now(), // 商店訂單編號
        'LoginType': 0, // 智付通會員
        'OrderComment': 'OrderComment', // 商店備註
        'Amt': Amt, // 訂單金額
        'ItemDesc': Desc, // 產品名稱
        'Email': email, // 付款人電子信箱
        'ReturnURL': ReturnURL, // 支付完成返回商店網址
        'NotifyURL': NotifyURL, // 支付通知網址/每期授權結果通知
        'ClientBackURL': ClientBackURL, // 支付取消返回商店網址
    }
  
    // console.log('===== getTradeInfo: data =====')
    // console.log(data)
  
  
    mpg_aes_encrypt = create_mpg_aes_encrypt(data)
    mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)
  
    // console.log('===== getTradeInfo: mpg_aes_encrypt, mpg_sha_encrypt =====')
    // console.log(mpg_aes_encrypt)
    // console.log(mpg_sha_encrypt)
  
    tradeInfo = {
        'MerchantID': MerchantID, // 商店代號
        'TradeInfo': mpg_aes_encrypt, // 加密後參數
        'TradeSha': mpg_sha_encrypt,
        'Version': 1.5, // 串接程式版本
        'PayGateWay': PayGateWay,
        'MerchantOrderNo': data.MerchantOrderNo,
    }
  
    // console.log('===== getTradeInfo: tradeInfo =====')
    // console.log(tradeInfo)
  
    return tradeInfo
}

const adminController = {
    signup: async (req, res)=>{
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }
        const user = await User.findOne({
            where: { email: data.email }
        })
        if(user) {
            return {
                status: "error",
                message: "Email has been used"
            }
        }
        const slat = bcrypt.genSaltSync(10);
        User.create({
            name: data.name,
            email: data.email,
            password: bcrypt.hashSync(data.password, slat),
            address: "",
            tel: "",
            avatar: "https://png.pngtree.com/png-clipart/20190619/original/pngtree-vector-avatar-icon-png-image_4013749.jpg",
            role: "user"
        }).then(()=>{
            return res.json({
                status: "success",
                message: "Account Create Success"
            });
        }).catch((err)=> console.log(err));
    },
    signin: async (req, res)=>{
        const data = {
            email: req.body.email,
            password: req.body.password
        }
        const user = await User.findOne({
            where: { email: data.email }
        })
        if(!user){
            return res.json({
                status: {
                    code: 300,
                },
                message: "email not found"
            })
        }
        if(!bcrypt.compareSync(data.password, user.password)){
            return res.json({
                status: {
                    code: 400
                },
                message: "password incorect"
            })
        }
        const payload = user.dataValues;
        const token = jwt.sign(payload, "test", { expiresIn: '1h' });
        return res.json({
            status: {
                code: 200
            },
            message: "login success",
            token,
            user
        })
    },
    getUserCarts: async (req, res)=>{
        const carts = await User.findByPk(req.params.id, {
            include: [
                { 
                    model: Cart,
                    include: [
                        CartItem, 
                        { model: Product, as: "items"},
                    ]
                },
            ]
        });
        const userCarts = [];
        carts.toJSON().Carts.forEach(cart=>{
            let temp = [];
            cart.items.forEach(item=>{
                let obj = {
                    ...item,
                    quantity: item.CartItem.quantity,
                    ordered: cart.ordered
                };
                temp.push(obj);
            })
            userCarts.push(temp);
        })
        return res.json({
            status: 'success',
            userCarts
        });
    },
    getUserCart: async (req, res)=>{
        try {
            const cartId = req.params.cartId;
            const cartItem = await Cart.findByPk(cartId, {
                include: [
                    { 
                        model: Product,
                        as: "items"
                    }
                ]
            })
            return res.json({
                status: "success",
                cartItem
            })
        } catch (err) {
            console.log(err);
        }
    },
    deleteUserCart: async (req, res)=>{
        try {
            const cartId = req.params.cartId;
            const cart = await Cart.findByPk(cartId);
            await cart.destroy();
            await CartItem.destroy({
                where: {
                    CartId: cartId
                }
            })
            return res.json({
                status: "success",
                message: "Delete Success"
            })
        } catch (err) {
            console.log(err);
        }
    },
    putUser: async (req, res)=>{
        try {
            const userId = req.params.id;
            const { file } = req;
            const data = { ...req.body};
            if(file){
                imgur.setClientID(IMGUR_ID);
                imgur.upload(file.path, async (err, img)=>{
                    if(err) return res.json({ status: "Error", message: "Warning" });
                    try {
                        const user = await User.findByPk(userId);
                        await user.update({
                            ...data,
                            avatar: file ? img.data.link : user.image
                        })
                        return res.json({
                            status: "success",
                            message: "User Update Success"
                        })
                    } catch (err) {
                        console.log(err);
                    }
                })
            }else{
                try {
                    const user = await User.findByPk(userId);
                    await user.update({
                        ...data,
                        avatar: user.avatar
                    })
                    return res.json({
                        status: "success",
                        message: "User Update Success"
                    })   
                } catch (err) {
                    console.log(err);
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
    getOrder: async (req, res)=>{
        try {
            const order = await Order.findAll({
                where: {
                    CartId: req.params.cartId
                }
            })
            return res.json({
                status: "success",
                orderId: order[0].dataValues.id
            })
        } catch (err) {
            console.log(err);
        }
    },
    postOrder: async (req, res)=>{
        const cartItems = req.body.cartItems;
        const cartId = cartItems[0].CartId;
        const buyerInfo = req.body.buyerInfo;
        let amount = 0;
        cartItems.forEach(item=>{
            amount += item.price * item.quantity
        })
        const order = await Order.create({
            name: buyerInfo.name,
            phone: buyerInfo.phone,
            address: buyerInfo.phone,
            amount,
            sn: 1000,
            shipping_status: false,
            payment_status: false,
            UserId: buyerInfo.id,
            CartId: cartId
        })
        await cartItems.forEach(item=>{
            OrderItem.create({
                OrderId: order.dataValues.id,
                ProductId: item.id,
                price: item.price,
                quantity: item.quantity
            })
        })
        const cart = await Cart.findByPk(cartId);
        await cart.update({
            ordered: true
        })
        return res.json({
            status: "success",
            message: "Order Create Success"
        })  
    },
    getPayment: async (req, res)=>{
        // console.log('===== getPayment =====')
        // console.log(req.params.id)
        // console.log('==========')
        
        const order = await Order.findByPk(req.params.id);
        const tradeInfo = await getTradeInfo(order.toJSON().amount, "產品名稱", "austin@gmail.com");
        return res.json({
            status: "success",
            tradeInfo
        })
    },
    spgatewayCallback: (req, res) => {
        console.log('===== spgatewayCallback =====')
        console.log(req.body)
        console.log('==========')
    
        return res.redirect('back')
    }
}

module.exports = adminController;