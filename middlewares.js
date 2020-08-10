//Authenticator Modules
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const models = require('./models');
const { User, Course } = models;
const { Op } = require('sequelize');

//AsyncHandler
  /* Handler middleware to wrap each route and hanlde errors. */ 
  const asyncHandler = middleware => {
    return async (req, res, next) => {
      try {
        await middleware(req, res, next);
      } catch (error) {
          const err = new Error(error.stack);
          err.status = 500;
          next(err);
      }
    };
  };

  //User authenticator
const authenticateUser = async (req, res, next) => {
    let message = null;
  
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
  
    // If the user's credentials are available...
    if (credentials) {
        // Attempt to retrieve the user from the data store
        // by their username (i.e. the user's "key"
        // from the Authorization header).
        await (async (req, res, next) => {
            await User.findAll({
              where: {
                emailAddress: {
                  [Op.eq]: credentials.name,
                }
              },
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            }).then( data => {
              const user = data[0];
  
              if(user) {
                // Use the bcryptjs npm package to compare the user's password
                // (from the Authorization header) to the user's password
                // that was retrieved from the data store.
                const authenticatedPass = bcryptjs
                  .compareSync(credentials.pass, user.password);
                //verifying the username
                const authenticatedUsername = credentials.name === user.emailAddress;
  
                // If the passwords and usernames match...
                if (authenticatedPass && authenticatedUsername) {
                  console.log(`Authentication successful for username: ${user.emailAddress}`);
          
                  // Then store the retrieved user object on the request object
                  // so any middleware functions that follow this middleware function
                  // will have access to the user's information.
                  req.currentUser = user;
                } else {
                    // Return a response with a 401 Unauthorized HTTP status code.
                    message = `Authentication failure for username: ${user.emailAddress}`;
                    const err = new Error(message);
                    err.status = 401;
                    next(err);
                  } 
              } else {
                  message = `User not found for username: ${credentials.name}`;
                  const err = new Error(message);
                  err.status = 401;
                  next(err);
                }
            });
        })(req, res, next); 
    } else {
        message = 'Auth header not found';
        const err = new Error(message);
        err.status = 401;
        next(err);
      }
  };

module.exports = { 
                    asyncHandler,
                    authenticateUser,
                }

  