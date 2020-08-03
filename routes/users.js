'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const models = require('../models');
const { User, Course } = models;
const { Op } = require('sequelize');
const router = express.Router();

/* Handler middleware to wrap each route and hanlde errors. */ 
const asyncHandler = middleware => {
  return async (req, res, next) => {
    try {
      await middleware(req, res, next);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  };
};

const authenticateUser = (req, res, next) => {
  let message = null;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (credentials) {
      // Attempt to retrieve the user from the data store
      // by their username (i.e. the user's "key"
      // from the Authorization header).
      (async () => {
        try {
          await User.findAll({
            where: {
              emailAddress: {
                [Op.eq]: credentials.name,
              }
            }
          }).then( data => {
            const user = data[0];

            if(user) {
              // Use the bcryptjs npm package to compare the user's password
              // (from the Authorization header) to the user's password
              // that was retrieved from the data store.
              const authenticatedPass = bcryptjs
                .compareSync(credentials.pass, user.password);
              // const authenticatedPass = credentials.pass === user.password;
              const authenticatedUsername = credentials.name === user.emailAddress;
              // console.log("Authenticated: ", authenticated);

              // If the passwords match...
              if (authenticatedPass && authenticatedUsername) {
                console.log(`Authentication successful for username: ${user.emailAddress}`);
        
                // Then store the retrieved user object on the request object
                // so any middleware functions that follow this middleware function
                // will have access to the user's information.
                req.currentUser = user;
                res.status(200).json({
                  username: user.emailAddress,
                });
              } else {
                message = `Authentication failure for username: ${user.emailAddress}`;
                res.json({
                  message: message
                }).end();
              } 
            } else {
              message = `User not found for username: ${credentials.name}`;
              res.json({
                message: message
              }).end();
            }
          });
        } catch(error) {
          res.status(500).json({
            error: error.message
          });
        } 
      })(); 
  } else {
    message = 'Auth header not found';
  }
  
  // If user authentication failed...
  if (message) {
    console.warn(message);
    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    // next();
    console.log("Finished");
  }
};

router.get('/users', asyncHandler(async (req, res, next) => {
  authenticateUser(req, res, next);
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
  check('password')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "password"'),
], (req, res) => {
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
    const newUser = await User.create({
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      password: user.password,
    });

    if(newUser) {
      // Set the status to 201 Created and end the response.
      res.status(201)
        .redirect('/')
        .end();
    } else {
      res.status(500).json({
        message: "Error creating user"
      });
    }
  }))();
});

module.exports = router;