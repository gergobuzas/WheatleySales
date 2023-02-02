const Joi = require("joi");

module.exports.productSchema = Joi.object({
     product: Joi.object({
          title: Joi.string().required(),
          price: Joi.number().required().min(0),
          image: Joi.string().required(),
          location: Joi.string().required(),
          description: Joi.string().required()
     }).required()
});

module.exports.userSchema = Joi.object({
     user: Joi.object({
          username: Joi.string().required(),
          email: Joi.string().required(),
          password: Joi.string().required()
     }).required()
});