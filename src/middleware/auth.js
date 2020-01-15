'use strict';

const Users = require('../models/users-model.js');
const users = new Users();
const jwt = require('jsonwebtoken');

/**
 * This function uses the basic auth encoding pattern to decode a username password string sent in the request header.
 * @param  {string}   authString  The encoded username and password that we are going to decode
 * @return {object}               An object containing the decoded, plain-text username and password
 */
function basicDecode(authString) {
    let base64Buffer = Buffer.from(authString, 'base64'); // base64 buffer conversion of string
    let bufferString = base64Buffer.toString(); // conversion from base64 buffer back to string
    let [username, password] = bufferString.split(':'); // split string using delimiter : to get pieces

    return {
        username: username,
        password: password,
    };
}

/**
 * This function takes base64 encoded credentials and attempts to find an existing user from those credentials
 * @param  {string} encodedCredentials  A string containing an encoded username and password
 * @return {object}                     The found (or not found) user from the authBasic function in the user model/schema
 */
async function basicAuth(encodedCredentials) {
    let credentials = basicDecode(encodedCredentials);
    let user = await users.getFromField({ username: credentials.username });

    user = user[0];

    if (user && user._id && (await user.comparePassword(credentials.password)))
        return user;
    else
        return {
            status: 401,
            message: 'Unable to authenticate from username and password',
        };
}

/**
 * This function takes a json web token and decrypts it to get the resulting user data (specifically, a user id)
 * @param  {string} token   The JWT generated for the client on sign in / sign up
 * @return {object}         The found (or not found) user from the get function in the user model
 */
async function bearerAuth(token) {
    let secret = process.env.SECRET || 'this-is-my-secret';
    let tokenData;

    try {
        tokenData = jwt.verify(token, secret);
    } catch (e) {
        return { status: 401, message: e.name };
    }

    if (tokenData.data.id) return await users.get(tokenData.data.id);
    else return { status: 401, message: 'Unable to authenticate from token' };
}

/**
 * This function takes an encoded username and password from a request header, decodes the username and password, and then authenticates those user credentials to (hopefully) return a user record from the database
 * @param  {object}   req   Our request object. We need to access the req.headers.authorization key-value.
 * @param  {object}   res   The response object. Because this is just middleware, we won't be editing the response value in this function
 * @param  {Function} next  This is what we use to either go to the next middleware or endpoint for our route, or to go to some error handling middleware
 */
module.exports = async (req, res, next) => {
    let auth, authType, authData, user;

    if (req.headers.authorization)
        auth = req.headers.authorization.split(/\s+/);

    if (auth && auth.length == 2) {
        authType = auth[0];
        authData = auth[1];
    }

    if (authType == 'Basic') user = await basicAuth(authData);
    else if (authType == 'Bearer') user = await bearerAuth(authData);

    if (!user) next();
    else if (user.status) next(user);
    else {
        req.user = user;
        req.token = 'Bearer ' + user.generateToken(req.headers.timeout);
        next();
    }
};
