const mongoose = require('mongoose');
const User = require('./users')
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
     title: String,
     images: [{
          url: String,
          filename: String
     }],
     price: Number,
     description: String,
     location: String,
     author: {
          type: Schema.Types.ObjectId,
          ref: 'User'
     }
})

module.exports = mongoose.model('Product', ProductSchema);