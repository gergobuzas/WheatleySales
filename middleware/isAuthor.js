const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Product = require('../models/products')

module.exports.isAuthor = async (req, res, next) => {
     const { id } = req.params;
     const foundProduct = await Product.findById(id);
     if (!foundProduct.author.equals(req.user._id)) {
          req.flash('error', "You don't have permission to do that!");
          return res.redirect(`/products/${id}`);
     }
     next();
}