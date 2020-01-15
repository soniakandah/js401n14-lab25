'use strict';

const express = require('express');
const router = express.Router();

const Books = require('../models/books-model.js');
const books = new Books();
const auth = require('../middleware/auth.js');

router.get('/books', auth, async (req, res, next) => {
    if (req.user && req.user.can('read')) {
        let allBooks = await books.getFromField({});
        let filteredBooks = [];

        allBooks.forEach(book => {
            if (book.auth.includes(req.user.role))
                filteredBooks.push({
                    _id: book._id,
                    title: book.title,
                    author: book.author,
                    auth: book.auth,
                });
        });

        res.status(200).json(filteredBooks);
    } else next({ status: 403, message: 'Unauthorized access' });
});

router.post('/books', auth, async (req, res, next) => {
    if (req.user && req.user.can('create')) {
        try {
            await books.create(req.body);
            res.status(200).json({});
        } catch (e) {
            next({ status: 400, message: e.name });
        }
    } else if (req.user && !req.user.can('create'))
        next({ status: 403, message: 'User cannot create books' });
    else next({ status: 403, message: 'Unauthorized access' });
});

router.patch('/books/:id', auth, async (req, res, next) => {
    if (req.user && req.user.can('update')) {
        try {
            await books.update(req.params.id, req.body);
            res.status(200).json({});
        } catch (e) {
            next({ status: 400, message: e.name });
        }
    } else if (req.user && !req.user.can('update'))
        next({ status: 403, message: 'User cannot update books' });
    else next({ status: 403, message: 'Unauthorized access' });
});

module.exports = router;
