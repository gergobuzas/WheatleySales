const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const Product = require('./models/products');
const User = require('./models/users')
const catchAsync = require('./utilities/catchAsync');
const expressError = require('./utilities/expressError');
const bcrypt = require('bcrypt');
const { join } = require('path');
const { title } = require('process');
const { productSchema } = require('./schemas/schemas.js');
const { randomUUID } = require('crypto');


main().catch(err => console.log(err));

async function main() {
     await mongoose.connect('mongodb://localhost:27017/wheatleysales');
     console.log('MONGO CONNECTED')
}



app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method')) // override with POST having ?_method=DELETE


app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const validateProduct = (req, res, next) => {
     const {error} = productSchema.validate(req.body);
     if (error) {
          const msg = error.details.map(el => el.message).join(', ');
          throw new expressError(msg);
     }
     else {
          next();
     }
}


app.get('/', (req, res) => {
     res.render('home.ejs');
})

app.get('/products', catchAsync(async (req, res, next) => {
     const products = await Product.find({});
     res.render('products/index.ejs', {products});
}))

app.get('/products/new', (req, res) => {
     res.render('products/new.ejs');
})

app.get('/products/:id', catchAsync(async (req, res, next) => {
     const { id } = req.params;
     const foundProduct = await Product.findById(id);
     res.render('products/show.ejs', {foundProduct});
}))

app.get('/products/:id/edit', catchAsync(async (req, res, next) => {
     const updatedProduct = await Product.findById(req.params.id);
     res.render('products/edit', {updatedProduct});
}))

app.post('/products', validateProduct, catchAsync(async (req, res, next) => {
     //if (!req.body.product) { throw new expressError('Invalid product data', 400); }
     const newProduct  = new Product(req.body.product);
     await newProduct.save();
     res.redirect(`/products/${newProduct._id}`);
}))







app.get('/register', (req, res) => {
     res.render('products/register.ejs');
})

app.post('/register', async (req, res) => {
          
          const hashedPassword = bcrypt.hash(req.body.password, 10);
          const newUser = new User({
               email: req.body.email,
               password: hashedPassword
          });
          await newUser.save();
          res.redirect(`/profile/${newUser._id}`);
          
});


app.get('/login', (req, res) => {
     res.render('products/login.ejs');
})

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Authenticate the user and return a JWT if successful
  if (username === 'yourusername' && password === 'yourpassword') {
    const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
    res.redirect('/profile');
  } else {
    res.redirect('/login');
  }
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/login', (req, res) => {
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

app.get('/profile', ensureAuthenticated, function(req, res) {
  res.render('profile', { user: req.user });
});

app.get('/profile/:id', catchAsync(async (req, res, next) => {
     const profile = await User.findById(req.params.id);
     res.render('profile', {profile});
}))

/*
app.post('/login', async (req, res) => {
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






app.put('/products/:id', validateProduct, catchAsync(async (req, res, next) => {
     const updatedProduct = req.body.product;
     const product = await Product.findByIdAndUpdate(req.params.id, updatedProduct);
     res.redirect(`/products/${product._id}`);
}))

app.delete('/products/:id', catchAsync(async (req, res, next) => {
     const {id} = req.params;
     await Product.findByIdAndDelete(id);
     res.redirect('/products');
}))

app.all('*', (req, res, next) => {
     next(new expressError('Page not found', 404));
})

app.use((err, req, res, next) => {
     const { statusCode = 500} = err;
     if(!err.message) err.message = 'Oh no! Something went wrong!'
     res.status(err);
     res.status(statusCode).render('error.ejs', { err } );
})

app.listen(3000, () => {
     console.log('PORT 3000');
})
