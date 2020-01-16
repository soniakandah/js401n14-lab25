'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Esoteric Resources
const errorHandler = require('./middleware/error.js');
const notFound = require('./middleware/404.js');
const authRouter = require('./routes/auth-router.js');
const bookRouter = require('./routes/book-router.js');
// Prepare the express app
const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res, next) => {
    res.send('Api Launched and Ready');
});

app.use(authRouter);
app.use(bookRouter);

// Catchalls
app.use(notFound);
app.use(errorHandler);

module.exports = {
    server: app,
    start: port => {
        const PORT = port || process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server Up on ${PORT}`);
        });

        // Start up DB Server
        const PATH = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/app';
        const options = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
        };

        mongoose.connect(PATH, options);
    },
};
