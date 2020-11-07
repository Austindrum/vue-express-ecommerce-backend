const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;

const checkIsLogin = async (req, res, next) => {
    const header = req.headers.authorization;
    if(header){
        const token = header.split(' ')[1];
        req.token = token;
    }else{
        return res.json({
            status: "forbidden",
            message: "JWT token not set"
        })
    }
    try {
        const jwtPayload = jwt.verify(req.token, "test");
        const user = await User.findByPk(jwtPayload.id);
        req.user = user;
        next();
    } catch (err) {
        return res.json({
            status: "forbidden",
            message: "Warinig: JWT token is over time"
        })
    }
}

module.exports = { checkIsLogin };