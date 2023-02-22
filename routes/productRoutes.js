const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Schema = mongoose.Schema;
const Product = require('../models/products')
const catchAsync = require('../utilities/catchAsync');
const {
     productSchema
} = require('../schemas/schemas.js');
const methodOverride = require('method-override');
const {
     isLoggedIn
} = require('../middleware/isLoggedIn');
const {
     validateProduct
} = require('../middleware/validateProduct');
const {
     validateId
} = require('../middleware/validateId')
const {
     isAuthorProducts
} = require('../middleware/isAuthorProducts');
const passport = require('passport');
const User = require('../models/users')
const {
     userSchema
} = require('../schemas/schemas.js');
const {
     storage
} = require('../cloudinary/cloudinary');
const multer = require('multer')
const upload = multer({
     storage
})



router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({
     extended: true
})) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/', catchAsync(async (req, res, next) => {
     const products = await Product.find({});
     res.render('../views/products/index.ejs', {
          products
     });
}))

router.get('/new', isLoggedIn, (req, res) => {
     res.render('../views/products/new.ejs');
})


router.post('/', upload.array('image'), isLoggedIn, validateProduct, catchAsync(async (req, res, next) => {
          req.flash('success', 'Succesfully added a new listing!');
          const newProduct = new Product(req.body.product);
          newProduct.author = req.user;
          newProduct.images = req.files.map(file => ({
               url: file.path,
               filename: file.filename
          }));
          await newProduct.save();
          res.redirect(`../products/${newProduct._id}`);
     })
     /*(req, res) => {
     console.log('BODY:', req.body, '\n\nFILES:', req.files);
     res.send('IT WORKED!!!!');
}*/
);

router.get('/:id', validateId, catchAsync(async (req, res, next) => {
     //TODO refactor to controller
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
}))

router.get('/:id/edit', isLoggedIn, validateId, isAuthorProducts, catchAsync(async (req, res, next) => {
     //TODO refactor to controller
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
}))


router.put('/:id', isLoggedIn, validateId, isAuthorProducts, upload.array('image'), validateProduct, catchAsync(async (req, res, next) => {
     const updatedProduct = req.body.product;
     const product = await Product.findByIdAndUpdate(req.params.id, updatedProduct);
     const images = req.files.map(file => ({
          url: file.path,
          filename: file.filename
     }))
     product.images.push(...images);
     await product.save();
     res.redirect(`../products/${product._id}`);
}))

router.delete('/:id', isLoggedIn, validateId, isAuthorProducts, catchAsync(async (req, res, next) => {
     const {
          id
     } = req.params;
     await Product.findByIdAndDelete(id);
     req.flash('success', 'Succesfully deleted a listing!');
     res.redirect('../');
}))

module.exports = router;