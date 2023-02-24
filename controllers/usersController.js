const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/users');
const Product = require('../models/products')
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');

module.exports.showRegisterPage = (req, res) => {
     res.render('users/register.ejs');
};

module.exports.registerNewUser = async (req, res, next) => {
     try {
          const {
               email,
               username,
               password
          } = req.body;
          const user = new User({
               email,
               username
          });
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
};

module.exports.showLoginPage = (req, res) => {
     res.render('users/login.ejs');
};

module.exports.loginUser = (req, res) => {
     const redirectUrl = req.session.returnTo || '/profile';
     req.flash('success', 'Welcome back!');
     res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
     req.logout((err) => {
          if (err) {
               return next(err);
          }
          req.flash('success', 'Successfully logged out!');
          res.redirect('/');
     });
};

module.exports.showOwnUserProfilePage = async function (req, res) {
     const userData = req.user;
     const products = await Product.find({});
     var profileProducts = [];
     for (const product of products) {
          if (product.author._id.equals(userData._id))
               profileProducts.push(product);
     }
     res.render('users/profile', {
          userData,
          profileProducts
     });
};

module.exports.redirectToProfile = (req, res) => {
     const {
          id
     } = req.params;
     res.redirect(`/profile/${id}`);
};

module.exports.showByIdUserProfilePage = async (req, res, next) => {
     const {
          id
     } = req.params;
     const profile = await User.findById({
          _id: id
     });
     if (!profile) {
          req.flash('error', "Profile doesn't exist!");
          return res.redirect('/products');
     }

     const products = await Product.find({});
     var profileProducts = [];
     for (const product of products) {
          if (product.author._id.equals(id))
               profileProducts.push(product);
     }
     res.render('users/profile', {
          userData: profile,
          profileProducts
     });
};