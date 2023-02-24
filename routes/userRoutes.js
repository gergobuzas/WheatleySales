const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Schema = mongoose.Schema;
const User = require('../models/users');
const Product = require('../models/products')
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const methodOverride = require('method-override');
const {
     isLoggedIn
} = require('../middleware/isLoggedIn');
const {
     validateId
} = require('../middleware/validateId');
const {
     showRegisterPage,
     registerNewUser,
     showLoginPage,
     loginUser,
     logoutUser,
     showOwnUserProfilePage,
     redirectToProfile,
     showByIdUserProfilePage
} = require('../controllers/usersController');




router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({
     extended: true
})) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE


router
     .get('/register', showRegisterPage)
     .post('/register', catchAsync(registerNewUser));


router
     .get('/login', showLoginPage)
     .post("/login", passport.authenticate('local', {
          failureFlash: true,
          failureRedirect: '/login',
          keepSessionInfo: true
     }), loginUser);


router.get('/logout', logoutUser);

router.get('/profile', isLoggedIn, showOwnUserProfilePage);

router.get('/users/:id', validateId, redirectToProfile);

router.get('/profile/:id', validateId, catchAsync(showByIdUserProfilePage))


module.exports = router;