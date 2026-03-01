const express = require('express');
require('dotenv').config();
const app = express();
const auth = require('./routes/auth');
const address = require('./routes/address');
const payment = require('./routes/payment');
const cart = require('./routes/cart');
const orders = require('./routes/orders');
const session = require('express-session');
require('./conn/conn');
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.get('/', (req, res) => {
    res.send('hi');
});

app.use('/api/auth', auth);
app.use('/api/address', address);
app.use('/api/payment', payment);
app.use('/api/cart', cart);
app.use('/api/orders', orders);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});