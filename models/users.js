const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
     email: {type: String, required:true, unique:true},
     username: { type: String, unique: true, required: true },
     reviews: [{
          type: Schema.Types.ObjectId,
          ref: 'Review'
     }]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);