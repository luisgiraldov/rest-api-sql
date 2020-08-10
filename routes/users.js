'use strict';

const express = require('express');
const { check, body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const models = require('../models');
const { User, Course } = models;
const { Op } = require('sequelize');
const router = express.Router();
const { asyncHandler, authenticateUser} = require('../middlewares');

router.get('/users', asyncHandler(async (req, res, next) => {
    //Authenticate the user before displaying it
    await authenticateUser(req, res, next);
    //retrieve the user
    const user = req.currentUser;
    if(user) {
      res.status(200).json({
                username: user.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName
              });
    }
 })
);

// Route that creates a new user.
router.post('/users', [
  check('firstName')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "firstName"'),
  check('lastName')
  .exists({ checkNull: true, checkFalsy: true})
  .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "emailAddress"'),
  body('emailAddress')
  .isEmail()
  .withMessage('Please provide a valid email address'),
  check('password')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "password"'),
], (req, res, next) => {
  //Validate Email


  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);

  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);
    // Return the validation errors to the client.
    return res.status(400).json({ errors: errorMessages });
  }

  // Get the user from the request body.
  const user = req.body;

  

  // Hash the new user's password.
  // const salt = bcrypt.genSaltSync(10);
  //to implement the hash and salt, go to https://github.com/dcodeIO/bcrypt.js
  user.password = bcryptjs.hashSync(user.password);

  // Add the user to the database.
  (asyncHandler( async (req, res, next) => {
    let newUser;
    try{
      newUser = await User.create({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        password: user.password,
      }).then( data => {
        // Set the status to 201 Created and end the response.
        res.status(201)
        .location('/')
        .end();
      });
    } catch(error){
      if(error.name === "SequelizeValidationError") {
        const err = new Error(error.errors);
        err.status = 400;
        next(err);
      } else if(error.errors[0].type === "unique violation"){
          const err = new Error("There is a user associated to this email address!");
          err.status = 409;
          next(err);
      } else {
            // console.log(error.errors);
            throw error;
        } 
    }
  }))(req, res, next);
});

module.exports = router;