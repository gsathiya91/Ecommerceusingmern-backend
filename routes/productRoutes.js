const router = require('express').Router();
const { json } = require('express');
const Product = require('../models/Product');
const User = require('../models/User');

//Get products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

//Create products
router.post('/addnewproduct', async (req, res) => {
    try {
        const { name, description, price, category, images: pictures } = req.body;
        const product = await Product.create({ name, description, price, category, pictures });
        const products = await Product.find();
        res.status(201).json(products);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

//Update product
router.patch('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const { name, description, price, category, images: pictures } = req.body;
        const product = await Product.findByIdAndUpdate(id, { name, description, price, category, pictures });
        const products = await Product.find();
        res.status(200).json(products);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

//Delete product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    try {
        const user = await User.findById(user_id);
        if (!user.isAdmin) return res.status(401).json("Access Denied! You are not an admin");
        await Product.findByIdAndDelete(id);
        const products = await Product.find();
        res.status(200).json(products);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

// Get product by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        const similiar = await Product.find({ category: product.category }).limit(5);
        res.status(200).json({ product, similiar });
    } catch (e) {
        res.status(400).send(e.message);
    }
})

router.get('/category/:category', async (req, res) => {
    const { category } = req.params;
    try {
        let products;
        if (category == "all") {
            products = await Product.find().sort([['date', -1]]);
        } else {
            products = await Product.find({ category })
        }
        res.status(200).json(products)
    } catch (e) {
        res.status(400).send(e.message);
    }
})

//cart routes
router.post('/addtocart', async (req, res) => {
    const { userId, productId, price } = req.body;

    try {
        const user = await User.findById(userId);
        const userCart = user.cart;
        if (user.cart[productId]) {
            userCart[productId] += 1;
        } else {
            userCart[productId] = 1;
        }
        userCart.count += 1;
        userCart.total = Number(userCart.total) + Number(price);
        user.cart = userCart;
        user.markModified('cart');
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

router.post('/increasecart', async (req, res) => {
    const { userId, productId, price } = req.body;
    try {
        const user = await User.findById(userId);
        const userCart = user.cart;
        userCart.total += Number(price);
        userCart.count += 1;
        userCart[productId] += 1;
        user.cart = userCart;
        user.markModified('cart');
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.post('/decreasecart', async (req, res) => {
    const { userId, productId, price } = req.body;
    try {
        const user = await User.findById(userId);
        const userCart = user.cart;
        userCart.total -= Number(price);
        userCart.count -= 1;
        userCart[productId] -= 1;
        user.cart = userCart;
        user.markModified('cart');
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

router.post('/removefromcart', async (req, res) => {
    const { userId, productId, price } = req.body;
    try {
        const user = await User.findById(userId);
        const userCart = user.cart;
        userCart.total -= Number(userCart[productId]) * Number(price);
        userCart.count -= userCart[productId];
        delete userCart[productId];
        user.cart = userCart;
        user.markModified('cart');
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

module.exports = router;