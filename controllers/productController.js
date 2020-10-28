const db = require("../models");
const Product = db.Product;


let productController = {
    getProducts: (req, res) => {
        return Product.findAll({
            raw: true,
            nest: true
        }).then(products=>{
            const data = products.map(product => ({
                ...product                
            }));
            res.json(data);
        }).catch(err => console.log(err))
    }
}

module.exports = productController;