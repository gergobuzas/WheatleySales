const mongoose = require('mongoose');

/*This middleware could be removed, when validating an ID in the current codebase
 *There is a bug with it validating every 12-byte string as valid
 *ObjectId('000000000000') --> 303030303030303030303030
 *
 *The router.get(...) and isAuthor methods are currently handling the 'validation' of the IDs, thus
 *making sure that this bug never occurs
 *  
 *Leaving the file here, because the project is only made for learning purposes!
 */
module.exports.validateId = (req, res, next) => {
     const { id } = req.params;
     if(!mongoose.Types.ObjectId.isValid(id)){
          req.flash('error', 'Invalid ID in URL');
          return res.redirect('/products');
     }
     next();
}

