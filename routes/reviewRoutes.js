const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/users');
const Review = require('../models/reviews');
const { isLoggedIn } = require('../middleware/isLoggedIn');
const { isAuthorReviews } = require('../middleware/isAuthorReviews')
const { isNotSelfReview } = require('../middleware/isNotSelfReview');


router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/profile/:id/reviews', catchAsync(async (req, res) => {
     try {
          const { id } = req.params;
          const userData = await User.findById(id).populate("reviews");
          const userReviews = userData.reviews;
          const filteredReviews = await Review.find({ '_id': { $in: userReviews } }).populate('author');
          return res.render('../views/reviews/index', { userData, id, currentUser: req.user, reviews: filteredReviews });
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

router.post('/profile/:id/reviews/new', isLoggedIn, isNotSelfReview, catchAsync(async (req, res) => {
          try {
               const { id } = req.params;
               const { title, rating, description } = req.body;
               const review = new Review({ title, rating, description });
               const reviewedUser = await User.findById(id);
               if (!review.rating) {
                    req.flash('error', "Please provide a valid rating!");
                    res.redirect(`/profile/${id}/reviews/new`);
               }
               review.date = Date.now();
               review.author = req.user;
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

router.delete('/profile/:id/reviews/:reviewId', isLoggedIn, isAuthorReviews, catchAsync(async (req, res) => {
     try {
          const { id, reviewId } = req.params;
          const reviewedUser = await User.findById(id);
          const userReviews = reviewedUser.reviews;
          console.log('ID:', id, '\n\nREVIEWID:', reviewId);
          
          reviewedUser.reviews = userReviews.filter((review) => review._id.toString() !== reviewId);
          await Review.deleteOne({ _id: reviewId });
          await reviewedUser.save();
          req.flash('success', 'Successfully deleted your review!');
          return redirect(`/profile/${id}/reviews`);
     } catch (err) {
          if (err instanceof mongoose.CastError) {
               req.flash('error', 'Invalid user ID');
          }
            return res.redirect('/products');
     }
}));

module.exports = router;