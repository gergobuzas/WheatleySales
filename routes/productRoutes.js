const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Schema = mongoose.Schema;
const Product = require('../models/products')
const catchAsync = require('../utilities/catchAsync');
const { productSchema } = require('../schemas/schemas.js');
const methodOverride = require('method-override');
const { isLoggedIn } = require('../middleware/isLoggedIn');
const { validateProduct } = require('../middleware/validateProduct');
const { validateId } = require('../middleware/validateId')
const { isAuthor } = require('../middleware/isAuthor');
const passport = require('passport');
const User = require('../models/users')
const { userSchema } = require('../schemas/schemas.js');



router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/', catchAsync(async (req, res, next) => {
     const products = await Product.find({});
     res.render('../views/products/index.ejs', {products});
}))

router.get('/new', isLoggedIn, (req, res) => {
     res.render('../views/products/new.ejs');
})


router.post('/', isLoggedIn, validateProduct, catchAsync(async (req, res, next) => {
     req.flash('success', 'Succesfully added a new listing!');
     const newProduct = new Product(req.body.product);
     newProduct.author = req.user;
     await newProduct.save();
     res.redirect(`../products/${newProduct._id}`);
}))

router.get('/:id', validateId, catchAsync(async (req, res, next) => {
     //TODO refactor to controller
     const { id } = req.params;
     const foundProduct = await Product.findById(id).populate('author');
     if (!foundProduct) { 
          req.flash('error', 'The listing doesnt exist');
          return res.redirect('/products');
     }
     res.render('../views/products/show.ejs', {foundProduct});
}))

router.get('/:id/edit', isLoggedIn, validateId, isAuthor, catchAsync(async (req, res, next) => {
     //TODO refactor to controller
     const updatedProduct = await Product.findById(req.params.id, err => {
          if(err){
               req.flash('error', 'Invalid product ID!');
               return res.redirect('/products');
          }
     }).populate('author');
     if (!updatedProduct) { 
          req.flash('error', 'The listing doesnt exist');
          res.redirect('/products');
     }
     res.render('../views/products/edit', {updatedProduct});
}))


router.put('/:id', isLoggedIn, validateId, isAuthor, validateProduct, catchAsync(async (req, res, next) => {
     const updatedProduct = req.body.product;
     const product = await Product.findByIdAndUpdate(req.params.id, updatedProduct);
     res.redirect(`../products/${product._id}`);
}))

router.delete('/:id', isLoggedIn, validateId, isAuthor, catchAsync(async (req, res, next) => {
     const {id} = req.params;
     await Product.findByIdAndDelete(id);
     req.flash('success', 'Succesfully deleted a listing!');
     res.redirect('../');
}))

module.exports = router;
