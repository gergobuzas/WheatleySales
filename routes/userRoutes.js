const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const expressError = require('../utilities/expressError');
const Schema = mongoose.Schema;
const User = require('../models/users')
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const { userSchema } = require('../schemas/schemas.js');
const methodOverride = require('method-override');
const { isLoggedIn } = require('../middleware/isLoggedIn');



router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/register', (req, res) => {
     res.render('users/register.ejs');
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
               if (err)
                  return next(err);
               req.flash('success', 'Profile succesfully registered!');
               res.redirect('/profile');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));


router.get('/login', (req, res) => {
     res.render('users/login.ejs');
     console.log('THIS USER IS:....', req.user);
})

router.post("/login", passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}) , (req, res) => {
     const redirectUrl = req.session.returnTo || '/profile';
     req.flash('success', 'Welcome back!');
     res.redirect(redirectUrl);
     console.log('THIS USER IS:....', req.user);
});


router.get('/logout', (req, res) => {
          req.logout((err) => {
               if (err) {
                    return next(err);
               }
               req.flash('success', 'Successfully logged out!');
               res.redirect('/');
          });
});

router.get('/profile', isLoggedIn, function (req, res) {
     const { username } = req.user;
     res.render('users/profile', {username});
});

router.get('/profile/:id', catchAsync(async (req, res, next) => {
     const profile = await User.findById(req.params.id);
     res.render('profile', {profile});
}))

module.exports = router;