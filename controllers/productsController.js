const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Schema = mongoose.Schema;
const Product = require('../models/products')
const passport = require('passport');
const User = require('../models/users')
const {
     storage
} = require('../cloudinary/cloudinary');
const multer = require('multer')
const upload = multer({
     storage
})
const {
     cloudinary
} = require('../cloudinary/cloudinary');



module.exports.getAllProductsPage = async (req, res, next) => {
     const products = await Product.find({});
     res.render('../views/products/index.ejs', {
          products
     });
};

module.exports.getNewProductPage = (req, res) => {
     res.render('../views/products/new.ejs');
};

module.exports.createNewProduct = async (req, res, next) => {
     req.flash('success', 'Succesfully added a new listing!');
     const newProduct = new Product(req.body.product);
     newProduct.author = req.user;
     newProduct.images = req.files.map(file => ({
          url: file.path,
          filename: file.filename
     }));
     await newProduct.save();
     res.redirect(`../products/${newProduct._id}`);
};

module.exports.showProductPage = async (req, res, next) => {
     const {
          id
     } = req.params;
     const foundProduct = await Product.findById(id).populate('author');
     if (!foundProduct) {
          req.flash('error', 'The listing doesnt exist');
          return res.redirect('/products');
     }
     res.render('../views/products/show.ejs', {
          foundProduct
     });
};

module.exports.showProductEditPage = async (req, res, next) => {
     const {
          id
     } = req.params;
     const updatedProduct = await Product.findById({
          _id: id
     }, err => {
          if (err) {
               req.flash('error', 'Invalid product ID!');
               return res.redirect('/products');
          }
     }).clone().populate('author');
     if (!updatedProduct) {
          req.flash('error', 'The listing doesnt exist');
          res.redirect('/products');
     }
     res.render('../views/products/edit', {
          updatedProduct
     });
};

module.exports.editProduct = async (req, res, next) => {
     const updatedProduct = req.body.product;
     const product = await Product.findByIdAndUpdate(req.params.id, updatedProduct);
     const images = req.files.map(file => ({
          url: file.path,
          filename: file.filename
     }))
     product.images.push(...images);
     await product.save();
     if (req.body.deleteImages) {
          for (let filename of req.body.deleteImages) {
               await cloudinary.uploader.destroy(filename);
          }
          await product.updateOne({
               $pull: {
                    images: {
                         filename: {
                              $in: req.body.deleteImages
                         }
                    }
               }
          });
     }
     res.redirect(`../products/${product._id}`);
};

module.exports.deleteProduct = async (req, res, next) => {
     const {
          id
     } = req.params;
     await Product.findByIdAndDelete(id);
     req.flash('success', 'Succesfully deleted a listing!');
     res.redirect('../');
};