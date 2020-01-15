'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const roles = require('./roles-schema');

/**
 * The schema definition for a user record
 * @type {mongoose.Schema}
 */
const users = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    role: { type: String, default: 'user', enum: ['admin', 'editor', 'user'] },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } },
);

users.virtual('virtual_role', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'role',
  justOne: true,
});

/**
 * Pre middleware which populates our virtual role_info field
 */
users.pre('findOne', function() {
  this.populate('virtual_role');
});

/**
 * Pre middleware which converts a string password into a hashed password before every save to MongoDB
 */
users.pre('save', async function() {
  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * [description]
 * @param  {[type]} auth [description]
 * @return {[type]}      [description]
 */
users.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * This function generates a JSON Web Token from a user's id, role and the application's secret
 * Because this is a methods function, `this` refers to an individual user record
 * @return {string} The generated jwt token
 */
users.methods.generateToken = function(timeout) {
  let expiry = timeout
    ? Math.floor(Date.now() / 1000) + parseInt(timeout)
    : Math.floor(Date.now() / 1000) + 60 * 60;

  let secret = process.env.SECRET || 'this-is-my-secret';
  let options = {
    data: {
      id: this._id,
    },
    exp: expiry,
  };

  return jwt.sign(options, secret);
};

/**
 * [can description]
 * @param  {[type]} capability [description]
 * @return {[type]}            [description]
 */
users.methods.can = function(capability) {
  return this.virtual_role.capabilities.includes(capability);
};

/**
 * Exporting a mongoose model generated from the above schema, statics, methods and middleware
 * @type {mongoose model}
 */
module.exports = mongoose.model('users', users);
