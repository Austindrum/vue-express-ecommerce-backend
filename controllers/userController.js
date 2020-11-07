const userController = {
    getCurrentUser: async (req, res) =>{
        try {
            if(req.user){
                return res.json({
                    status: "success",
                    user: req.user
                })
            }
            return res.json({
                status: "forbidden",
                message: "No user data",
                user: {}
            })
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = userController;