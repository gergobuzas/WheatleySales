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



router.use(express.json()) // for parsing application/json
router.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')) // override with POST having ?_method=DELETE

router.get('/register', (req, res) => {
     res.render('users/register.ejs');
})

router.post('/register', async (req, res) => {
     const { username, email, password } = req.body;
     User.register(new User({ email: email, username: username }), password, function (err, user) {
          if (err) {
               req.flash('error', 'Username or Email already exists!');
               res.redirect('/users/register');
          }
          else {
               req.flash('success', 'Account has been created!');
               res.redirect(`/users/login`);
          }
     });
});


router.get('/login', (req, res) => {
     res.render('users/login.ejs');
})

router.post("/login", passport.authenticate('local', {failureFlash: true, failureRedirect: '/users/login'}) , (req, res) => {
     req.flash('success', 'Welcome back!');
     res.redirect('../products');
    
     /*if (!req.body.username) {
         req.flash('error', 'No username was given!');
    }
    else if (!req.body.password) {
        req.flash('error', 'No password was given!');
    }
    else {
        passport.authenticate("local", function (err, user, info) {
            if (err) {
                 req.flash('error', 'Something went wrong...');
            }
            else {
                if (!user) {
                     req.flash('error', 'Wrong username or password...');
                }
                else {
                    const token = jwt.sign({ userId: user._id, username: user.username }, secretkey, { expiresIn: "24h" });
                    res.json({ success: true, message: "Authentication successful", token: token });
                }
            }
        })(req, res);
    }*/
});


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Authenticate the user and return a JWT if successful
  if (username === 'yourusername' && password === 'yourpassword') {
    const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
    res.redirect('/profile');
  } else {
    res.redirect('/login');
  }
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

router.get('/profile', ensureAuthenticated, function(req, res) {
  res.render('profile', { user: req.user });
});

router.get('/profile/:id', catchAsync(async (req, res, next) => {
     const profile = await User.findById(req.params.id);
     res.render('profile', {profile});
}))

/*
router.post('/login', async (req, res) => {
  await User.findOne({
      email: req.body.email
    })
    .exec((err, user) => {
      if (err) {
        res.status(500)
          .send({
            message: err
          });
        return;
      }
      if (!user) {
        return res.status(404)
          .send({
            message: "User Not found."
          });
      }

      //comparing passwords
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      // checking if password was valid and send response accordingly
      if (!passwordIsValid) {
        return res.status(401)
          .send({
            accessToken: null,
            message: "Invalid Password!"
          });
      }
      //signing token with user id
      var token = jwt.sign({
        id: user.id
      }, process.env.API_SECRET, {
        expiresIn: 86400
      });

      //responding to client request with user profile success message and  access token .
      res.status(200)
        .send({
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
          },
          message: "Login successfull",
          accessToken: token,
        });
    });

});
*/

module.exports = router;