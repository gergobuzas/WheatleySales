const mongoose = require('mongoose');
const User = require('./users')
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
     rating: Number,
     description: String,
     date: Date,
     author: {
          type: Schema.Types.ObjectId,
          ref: 'User'
     }
})

module.exports = mongoose.model('Review', ReviewSchema);