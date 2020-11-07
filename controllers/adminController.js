const db = require("../models");
const User = db.User;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    }
}

module.exports = adminController;