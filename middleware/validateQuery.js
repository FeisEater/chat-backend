"use strict";

const inspector = require("schema-inspector");
const _ = require("lodash");

const sanitizations = require("../config/bodyValidations").sanitizations;
const validations = require("../config/bodyValidations").validations;
const errors = require("../config/errors");

/**
 * Unmade validation for queries inside route paths e.g. /item?name=dude&amount=10
 */
module.exports.validateQuery = (name, schema) => (req, res, next) => {

};
