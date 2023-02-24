const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const catchAsync = require('../utilities/catchAsync');

const {
     isLoggedIn
} = require('../middleware/isLoggedIn');
const {
     isAuthorReviews
} = require('../middleware/isAuthorReviews')
const {
     isNotSelfReview
} = require('../middleware/isNotSelfReview');

const {
     showUserReviewsPage,
     showNewUserReviewPage,
     createNewUserReview,
     deleteUserReview
} = require('../controllers/reviewsController');


router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({
     extended: true
})) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE


router.get('/profile/:id/reviews', catchAsync(showUserReviewsPage));

router
     .get('/profile/:id/reviews/new', isLoggedIn, catchAsync(showNewUserReviewPage))
     .post('/profile/:id/reviews/new', isLoggedIn, isNotSelfReview, catchAsync(createNewUserReview));

router.delete('/profile/:id/reviews/:reviewId', isLoggedIn, isAuthorReviews, catchAsync(deleteUserReview));

module.exports = router;