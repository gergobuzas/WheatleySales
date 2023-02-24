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
const {
     cloudinary
} = require('../cloudinary/cloudinary');

const {
     getAllProductsPage,
     getNewProductPage,
     createNewProduct,
     showProductPage,
     showProductEditPage,
     editProduct,
     deleteProduct
} = require('../controllers/productsController');


router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({
     extended: true
})) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE



router
     .get('/', catchAsync(getAllProductsPage))
     .post('/', upload.array('image'), isLoggedIn, validateProduct, catchAsync(createNewProduct));

router.get('/new', isLoggedIn, getNewProductPage);

router
     .get('/:id', validateId, catchAsync(showProductPage))
     .put('/:id', isLoggedIn, validateId, isAuthorProducts, upload.array('image'), validateProduct, catchAsync(editProduct))
     .delete('/:id', isLoggedIn, validateId, isAuthorProducts, catchAsync(deleteProduct));

router.get('/:id/edit', isLoggedIn, validateId, isAuthorProducts, catchAsync(showProductEditPage));


module.exports = router;