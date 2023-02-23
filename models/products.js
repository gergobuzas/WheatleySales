const mongoose = require('mongoose');
const User = require('./users')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
     url: String,
     filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
     return this.url.replace('/upload', '/upload/w_200');
})

const ProductSchema = new Schema({
     title: String,
     images: [ImageSchema],
     price: Number,
     description: String,
     location: String,
     author: {
          type: Schema.Types.ObjectId,
          ref: 'User'
     }
})

module.exports = mongoose.model('Product', ProductSchema);