const User = require('../models/users');

module.exports.isNotSelfReview = async (req, res, next) => {
     const { id } = req.params;
     const reviewedUser = await User.findById(id);
     try {     
          if (reviewedUser.username === req.user.username) {
               req.flash('error', "You cannot write a review for yourself!");
               return res.redirect(`/profile/${id}/reviews`); 
          }
     } catch {
          req.flash('error', "Invalid product ID");
          return res.redirect(`/products`);
     }
     next();
}