'use strict';

const express = require('express');
const router = express.Router();

const Users = require('../models/users-model.js');
const users = new Users();
const auth = require('../middleware/auth.js');

/**
 * @route POST /signup
 * This route creates a new user in our database
 * @param {string}  username.body.required   We need a username in order to create a user
 * @param {string}  password.body.required   We need a password in order to create a user
 * @returns {string} 200 - The Bearer token
 */
router.post('/signup', async (req, res, next) => {
    console.log(req);
    console.log(req.body);
    try {
        let user = await users.create(req.body);
        let token = 'Bearer ' + user.generateToken();

        res.status(200).json({ token: token, role: user.role });
    } catch (e) {
        console.log(e);
        next(e);
    }
});

/**
 * @route POST /signin
 * This route authenticates and signs in a user. Most functionality is handled by the auth middleware
 * @param {string}    authorization.headers.required    We need a basicAuth string in req.headers.authorization
 * @security          basicAuth
 * @returns {string}  200 - The Bearer token
 */
router.post('/signin', auth, (req, res) => {
    res.status(200).json({ token: req.token, role: req.user.role });
});

module.exports = router;
