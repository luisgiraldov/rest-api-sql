'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const models = require('../models');
const { User, Course } = models;
const { Op } = require('sequelize');
const router = express.Router();
const { asyncHandler, authenticateUser} = require('../middlewares');

//Route to get all courses and their owner
router.get('/courses', asyncHandler(async (req, res) => {
        const Courses = await Course.findAll({
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            include: [
                {
                    model: User,
                    attributes: { 
                        exclude: ['password', 'salt','createdAt', 'updatedAt']
                    }
                }
            ],
        });

        res.status(200).json({
            Courses: Courses
        });
    })
);

//Route to get specific course
router.get('/courses/:id', asyncHandler(async (req, res, next) => {
    const CourseFound = await Course.findAll({
        where: {
            id: {
                [Op.eq]: req.params.id
            }
        },
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include: [
            {
                model: User,
                attributes: { 
                    exclude: ['password', 'salt','createdAt', 'updatedAt']
                }
            }
        ],
    });

    if(CourseFound.length > 0) {
        res.status(200).json({
            CourseFound: CourseFound
        });
    } else {
        const err = new Error("Course not found");
        err.status = 404;
        next(err);
    }
}));

//Route that creates a new course
router.post('/courses', [
    check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
    check('description')
    .exists({ checkNull: true, checkFalsy: true})
    .withMessage('Please provide a value for "description"'),
  ], asyncHandler(async (req, res, next) => {
    //Authenticate user before posting on database
    await authenticateUser(req, res, next);
    const user = req.currentUser;

    //If user authenticated continue the process, otherwise respond with unauthorized user
    if(!user){
        // Return to stop execution due to authentication error.
        return false;
    }

    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
        // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);

        // Return the validation errors to the client.
        return res.status(400).json({ errors: errorMessages }); 
    }

    //Get the user from the request body
    const course = req.body;

    // Add the user to the database.
    (asyncHandler( async (req, res, next) => {
        const estimatedTime = course.estimatedTime ? course.estimatedTime : null;
        const materialsNeeded = course.materialsNeeded ? course.materialsNeeded : null;
        let newCourse;
        try {
                newCourse = await Course.findOrCreate({
                    where: {
                        title: course.title,
                        description: course.description,
                    }, 
                    defaults: {
                        userId: course.userId,
                        estimatedTime: estimatedTime,
                        materialsNeeded: materialsNeeded
                    },  
                }).then( data => {
                    const courseReturned = data[0];
                    const created = data[1];
                    if(created){
                        // Set the status to 201 Created and end the response.
                        res.status(201)
                        .location(`/api/courses/${courseReturned.id}`)
                        // .location('/')
                        .end();
                    } else {
                        const err = new Error("Course already exists!");
                        err.status = 409;
                        next(err);   
                    } 
                });
        } catch(error) {
            if(error.name === "SequelizeValidationError") {
                const err = new Error(error.message);
                err.status = 400;
                next(err);
            } else if( error.name === "SequelizeForeignKeyConstraintError") {
                    const err = new Error(error.message);
                    err.status = 400;
                    next(err);
            } else {
                    // console.log(error.errors);
                    throw error;
              }
        }
    }))(req, res, next);
  }));

  //Route to update Course
  router.put('/courses/:id', [
        check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
        check('description')
        .exists({ checkNull: true, checkFalsy: true})
        .withMessage('Please provide a value for "description"'),
    ], asyncHandler( async(req, res, next) => {
        //Authenticate user before posting on database
        await authenticateUser(req, res, next);
        const user = req.currentUser;

        //If user authenticated continue the process, otherwise respond with unauthorized user
        if(!user){
            // Return to stop execution due to authentication error.
            return false;
        }

        // Attempt to get the validation result from the Request object.
        const errors = validationResult(req);

        // If there are validation errors...
        if (!errors.isEmpty()) {
            // Use the Array `map()` method to get a list of error messages.
            const errorMessages = errors.array().map(error => error.msg);

            // Return the validation errors to the client.
            return res.status(400).json({ errors: errorMessages }); 
        }

        const fieldsToUpdate = req.body;
        try {

            const getCourse = await Course.findByPk(req.params.id);

            //If the course is not found return a 404 error
            if(getCourse === null){
                return res.status(404).json({
                    message: "Course not found"
                });
            }

            if(user.id != getCourse.userId) {
                // Return to stop execution due to authentication error.
                return res.status(403).json({
                    message: "User is not authorized to modify this course"
                });
            }

            await getCourse.update(
                {...fieldsToUpdate},
                {where: {
                            id: {
                                [Op.eq]: req.params.id
                            }
                        }
                },
            ).then(course => {
                    console.log("Course: " + req.params.id + " successfully updated");
                    res.status(204).end();
                });
        } catch(error){
            if(error.name === "SequelizeValidationError") {
                const err = new Error(error.errors);
                err.status = 400;
                next(err);
              } else {
                //console.log(error.errors)
                throw error;
              }
        }
  }));

  //Route to delete course
  router.delete('/courses/:id', asyncHandler( async(req, res, next) => {
    //Authenticate user before deleting
    await authenticateUser(req, res, next);
    const user = req.currentUser;

    //If user authenticated continue the process, otherwise respond with unauthorized user
    if(!user){
        // Return to stop execution due to authentication error.
        return false;
    }

    const getCourse = await Course.findByPk(req.params.id);

    //If the course is not found return a 404 error
    if(getCourse === null){
        return res.status(404).json({
            message: "Course not found"
        });
    }

    if(user.id != getCourse.userId) {
        // Return to stop execution due to authentication error.
        return res.status(403).json({
            message: "User is not authorized to modify this course"
        });
    }

    await getCourse.destroy({
        where: {
            id: req.params.id
        }
    })
    .then( course => {
        console.log("Course: " + req.params.id + " successfully deleted");
        res.status(204).end();
    });
  }));

module.exports = router;