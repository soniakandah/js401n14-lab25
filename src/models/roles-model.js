'use strict';

const Model = require('./model.js');
const schema = require('./roles-schema.js');

/**
 * A class representing the role model in our database.
 * This is in fact a wrapper for our mongoose model
 * defined in roles-schema.js
 */
class Roles extends Model {
  /**
   * The constructor of our model
   * @return {Roles}  A newly created Roles object
   */
  constructor() {
    super(schema);
  }
}

module.exports = Roles;
