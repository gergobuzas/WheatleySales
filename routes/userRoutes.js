const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Schema = mongoose.Schema;
const User = require('../models/users');
const Product = require('../models/products')
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const { userSchema } = require('../schemas/schemas.js');
const methodOverride = require('method-override');
const { isLoggedIn } = require('../middleware/isLoggedIn');
const { validateId } = require('../middleware/validateId')




router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/register', (req, res) => {
     res.render('users/register.ejs');
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
               if (err)
                  return next(err);
               req.flash('success', 'Profile succesfully registered!');
               res.redirect('/profile');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));


router.get('/login', (req, res) => {
     res.render('users/login.ejs');
})

router.post("/login", passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}) , (req, res) => {
     const redirectUrl = req.session.returnTo || '/profile';
     req.flash('success', 'Welcome back!');
     res.redirect(redirectUrl);
});


router.get('/logout', (req, res) => {
          req.logout((err) => {
               if (err) {
                    return next(err);
               }
               req.flash('success', 'Successfully logged out!');
               res.redirect('/');
          });
});

router.get('/profile', isLoggedIn, async function (req, res) {
     const userData = req.user;
     const products = await Product.find({});
     var profileProducts = [];
     for (const product of products){
          if (product.author._id.equals(userData._id))
               profileProducts.push(product);
     }
     res.render('users/profile', { userData, profileProducts });
});

router.get('/users/:id', validateId, (req, res) => {
     const { id } = req.params;
     res.redirect(`/profile/${id}`);
});

router.get('/profile/:id', validateId, catchAsync(async (req, res, next) => {
     const { id } = req.params;
     const profile = await User.findById({ _id: id });
     if (!profile) {
          req.flash('error', "Profile doesn't exist!");
          return res.redirect('/products');
     }
     
     const products = await Product.find({});
     var profileProducts = [];
     for (const product of products){
          if (product.author._id.equals(id))
               profileProducts.push(product);
     }
     res.render('users/profile', { userData: profile, profileProducts });
}))


module.exports = router;