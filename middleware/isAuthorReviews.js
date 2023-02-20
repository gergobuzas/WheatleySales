const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Review = require('../models/reviews')

module.exports.isAuthorReviews = async (req, res, next) => {
     const { reviewId } = req.params;
     const foundReview = await Review.findById(reviewId);
     try {
          if (!foundReview.author.equals(req.user._id)) {
               req.flash('error', "You don't have permission to do that!");
               return res.redirect(`/products/${id}`);
          }
     } catch {
          req.flash('error', "Invalid product ID");
          return res.redirect(`/products`);
     }
     next();
}