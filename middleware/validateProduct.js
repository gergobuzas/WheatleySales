const { productSchema } = require('../schemas/schemas');

module.exports.validateProduct = (req, res, next) => {
     const {error} = productSchema.validate(req.body);
     if (error) {
          const msg = error.details.map(el => el.message).join(', ');
          throw new expressError(msg);
     }
     else {
          next();
     }
}