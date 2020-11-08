const db = require("../models");
const User = db.User;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const imgur = require('imgur-node-api');
const IMGUR_ID = process.env.IMGUR_ID;

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
    putUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { file } = req;
            const data = { ...req.body};
            console.log(data);
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
    }
}

module.exports = adminController;