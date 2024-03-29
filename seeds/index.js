const mongoose = require('mongoose');
const Product = require('../models/products')
const cities = require('./cities');
const {brands, productNames} = require('./seedHelpers');
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/wheatleysales');
  console.log('MONGO CONNECTED')
}

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Product.deleteMany({});
    for(let i = 0; i < 5; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        var brand = sample(brands);
        var productName = sample(productNames);
         const newProduct = new Product({
            author: '63e3d43fd8e4830c405996e6',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${brand} ${productName}`,
            price: `${Math.floor(Math.random() * 1000)}`,
            image: 'https://source.unsplash.com/random/?tech',
            description: `Description for ${brand} ${productName}`
        });
        await newProduct.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})