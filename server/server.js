const express = require('express');
require('dotenv').config();
const app = express();
const auth = require('./routes/auth');
require('./conn/conn');
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.get('/', (req, res) => {
    res.send('hi');
});

app.use('/api/auth', auth);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});