const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/users')
const { isLoggedIn } = require('../middleware/isLoggedIn');

router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/profile/:id/reviews', catchAsync(async (req, res) => {
     //TODO Refactor to  controller
     try {
          const { id } = req.params;
          const userData = await User.find({ id });
          console.log(userData);
          return res.render('../views/reviews/index', { userData, id});
     } catch {
          req.flash('error', "This user doesn't exist");
          res.send('/products');
     }
     
}));

router.get('/profile/:id/reviews/new', isLoggedIn, catchAsync(async (req, res) => {
     if (req.user != currentUser){
          //TODO Refactor to controller
          try {
               const { id } = req.params;
               const userData = await User.find({ id });
               return res.render('../views/reviews/new', { userData });
          } catch {
               req.flash('error', "This user doesn't exist");
               return res.send('/products');
          }
     } else {
          const { id } = req.params;
          req.flash('error', "You cannot do this!");
          return res.send(`/profile/${id}/reviews`); 
     }
}));

router.get('/profile/:id/reviews/:reviewId', (req, res) => {
     
});

module.exports = router;