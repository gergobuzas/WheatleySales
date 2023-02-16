const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/users');
const Review = require('../models/reviews');
const { isLoggedIn } = require('../middleware/isLoggedIn');


router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/profile/:id/reviews', catchAsync(async (req, res) => {
     try {
          const { id } = req.params;
          const userData = await User.findById(id).populate("reviews");
          const userReviews = userData.reviews;
          console.log('USER REVIEWS\n', userReviews);
          const sortedReviews = await Review.find({ '_id': { $in: userReviews } }).populate('author');
          console.log('SORTED REVIEWS\n', sortedReviews);
          return res.render('../views/reviews/index', { userData, id, currentUser: req.user, reviews: sortedReviews });
     } catch {
          req.flash('error', "This user doesn't exist");
          res.redirect('/products');
     }
}));

router.get('/profile/:id/reviews/new', isLoggedIn, catchAsync(async (req, res) => {
          //TODO Refactor to controller/
          try {
               const { id } = req.params;
               const userData = await User.findById(id);
               return res.render('../views/reviews/new', { userData });
          } catch {
               req.flash('error', "This user doesn't exist");
               return res.redirect('/products');
          }
}));

router.post('/profile/:id/reviews/new', isLoggedIn, catchAsync(async (req, res) => {
          try {
               const { id } = req.params;
               const { title, rating, description } = req.body;

               const review = new Review({ title, rating, description });
               if (!review.rating) {
                    req.flash('error', "Please provide a valid rating!");
                    res.redirect(`/profile/${id}/reviews/new`);
               }
               review.date = Date.now();
               review.author = req.user;

               const reviewedUser = await User.findById(id);
               if (reviewedUser.username === req.user.username) {
                    req.flash('error', "You cannot write a review for yourself!");
                    return res.redirect(`/profile/${id}/reviews`); 
               }
               await review.save()
               reviewedUser.reviews.push(review);
               await reviewedUser.save();
               
               req.flash('success', 'Added a review to the profile!');
               res.redirect(`/profile/${id}/reviews`);
          } catch {
               req.flash('error', "This user doesn't exist");
               return res.redirect('/products');
          }
}));

router.get('/profile/:id/reviews/:reviewId', (req, res) => {
     
});

module.exports = router;