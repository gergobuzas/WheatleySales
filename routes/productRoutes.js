const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Schema = mongoose.Schema;
const Product = require('../models/products')
const catchAsync = require('../utilities/catchAsync');
const { productSchema } = require('../schemas/schemas.js');
const methodOverride = require('method-override');

const validateProduct = (req, res, next) => {
     const {error} = productSchema.validate(req.body);
     if (error) {
          const msg = error.details.map(el => el.message).join(', ');
          throw new expressError(msg);
     }
     else {
          next();
     }
}

router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/', catchAsync(async (req, res, next) => {
     const products = await Product.find({});
     res.render('../views/products/index.ejs', {products});
}))

router.get('/new', (req, res) => {
     res.render('../views/products/new.ejs');
})

router.get('/:id', catchAsync(async (req, res, next) => {
     const { id } = req.params;
     const foundProduct = await Product.findById(id);
     if (!foundProduct) { 
          req.flash('error', 'The listing doesnt exist');
          res.redirect('/products');
     }
     res.render('../views/products/show.ejs', {foundProduct});
}))

router.get('/:id/edit', catchAsync(async (req, res, next) => {
     const updatedProduct = await Product.findById(req.params.id);
     if (!updatedProduct) { 
          req.flash('error', 'The listing doesnt exist');
          res.redirect('/products');
     }
     res.render('../views/products/edit', {updatedProduct});
}))

router.post('/', validateProduct, catchAsync(async (req, res, next) => {
     //if (!req.body.product) { throw new expressError('Invalid product data', 400); }
     req.flash('success', 'Succesfully added a new listing!');
     const newProduct  = new Product(req.body.product);
     await newProduct.save();
     res.redirect(`../products/${newProduct._id}`);
}))

router.put('/:id', validateProduct, catchAsync(async (req, res, next) => {
     const updatedProduct = req.body.product;
     const product = await Product.findByIdAndUpdate(req.params.id, updatedProduct);
     res.redirect(`../products/${product._id}`);
}))

router.delete('/:id', catchAsync(async (req, res, next) => {
     req.flash('success', 'Succesfully deleted a listing!');
     const {id} = req.params;
     await Product.findByIdAndDelete(id);
     res.redirect('../');
}))

module.exports = router;
