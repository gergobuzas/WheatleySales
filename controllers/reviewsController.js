const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Schema = mongoose.Schema;
const passport = require('passport');
const User = require('../models/users')
const Review = require('../models/reviews');

module.exports.showUserReviewsPage = async (req, res) => {
     try {
          const {
               id
          } = req.params;
          const userData = await User.findById(id).populate("reviews");
          const userReviews = userData.reviews;
          const filteredReviews = await Review.find({
               '_id': {
                    $in: userReviews
               }
          }).populate('author');
          return res.render('../views/reviews/index', {
               userData,
               id,
               currentUser: req.user,
               reviews: filteredReviews
          });
     } catch {
          req.flash('error', "This user doesn't exist");
          res.redirect('/products');
     }
};

module.exports.showNewUserReviewPage = async (req, res) => {
     //TODO Refactor to controller/
     try {
          const {
               id
          } = req.params;
          const userData = await User.findById(id);
          return res.render('../views/reviews/new', {
               userData
          });
     } catch {
          req.flash('error', "This user doesn't exist");
          return res.redirect('/products');
     }
};

module.exports.createNewUserReview = async (req, res) => {
     try {
          const {
               id
          } = req.params;
          const {
               title,
               rating,
               description
          } = req.body;
          const review = new Review({
               title,
               rating,
               description
          });
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
};

module.exports.deleteUserReview = async (req, res) => {
     try {
          const {
               id,
               reviewId
          } = req.params;
          const reviewedUser = await User.findById(id);
          const userReviews = reviewedUser.reviews;
          console.log('ID:', id, '\n\nREVIEWID:', reviewId);

          reviewedUser.reviews = userReviews.filter((review) => review._id.toString() !== reviewId);
          await Review.deleteOne({
               _id: reviewId
          });
          await reviewedUser.save();
          req.flash('success', 'Successfully deleted your review!');
          return redirect(`/profile/${id}/reviews`);
     } catch (err) {
          if (err instanceof mongoose.CastError) {
               req.flash('error', 'Invalid user ID');
          }
          return res.redirect('/products');
     }
};