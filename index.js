const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const http = require('http');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: 'http://localhost:8000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
})

const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const imageRoutes = require('./routes/imageRoutes');
const orderRoutes = require('./routes/orderRoutes')

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/images', imageRoutes);
app.use('/orders', orderRoutes);

//Stripe 
app.post('/create-payment', async(req, res)=> {
    const {amount} = req.body;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'inr',
        payment_method_types: ['card']
      });
      res.status(200).json(paymentIntent)
    } catch (e) {
      console.log(e.message);
      res.status(400).json(e.message);
     }
  })
  

//Port
server.listen(8000, () => {
    console.log('server is running at port 8000')
})
//Db connection
mongoose.connect("mongodb+srv://Ecommerce-app:ecommerceusingmern@cluster0.ktemn.mongodb.net/Ecommerceusingmern?retryWrites=true&w=majority")
    .then(() => {
        console.log("DB connected successfully")
    }).catch((err) => {
        console.log(err)
    })
mongoose.connection.on('error', err => {
    console.log(err);
})
