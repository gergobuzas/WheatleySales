if (process.env.NODE_ENV !== 'production') {
     require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const User = require('./models/users')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressError = require('./utilities/expressError');



const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes')

main().catch(err => console.log(err));

async function main() {
     await mongoose.connect('mongodb://localhost:27017/wheatleysales');
     console.log('MONGO CONNECTED')
}


app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const sessionConfig = {
     secret: 'thisshouldbeabettersecret',
     resave: false,
     saveUninitialized: true,
     cookie: {
          httpOnly: true,
          expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
          maxAge: 1000 * 60 * 60 * 24 * 7
     }
}


app.use(session(sessionConfig));
app.use(flash());


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({
     extended: true
})) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method')) // override with POST having ?_method=DELETE

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req, res, next) => {
     res.locals.currentUser = req.user;
     res.locals.success = req.flash('success');
     res.locals.error = req.flash('error');
     next();
});


app.use('/', userRoutes);
app.use('/', reviewRoutes);
app.use('/products', productRoutes);

app.get('/', (req, res) => {
     res.render('home.ejs');
})

app.all('*', (req, res, next) => {
     next(new expressError('Page not found', 404));
     console.log('404');
})

app.use((err, req, res, next) => {
     const {
          statusCode = 500
     } = err;
     if (!err.message) err.message = 'Oh no! Something went wrong!'
     res.status(err);
     res.status(statusCode).render('error.ejs', {
          err
     });
})

app.listen(3000, () => {
     console.log('PORT 3000');
})