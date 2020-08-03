'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
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

//Route to get all courses and their owner
router.get('/courses', asyncHandler(async (req, res) => {
        const Courses = await Course.findAll({
            include: [
                {
                    model: User,
                },
            ],
        });

        res.status(200).json({
            Courses: Courses
        });
    })
);

//Route to get specific course
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const CourseFound = await Course.findAll({
        where: {
            id: {
                [Op.eq]: req.params.id
            }
        },
        include: [
            {
                model: User,
            }
        ],
    });

    if(CourseFound.length > 0) {
        res.status(200).json({
            CourseFound: CourseFound
        });
    } else {
        console.log(CourseFound);
        res.status(404).json({
            message: "Course not found"
        });
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

    //Get the user from the request body
    const course = req.body;

    // Add the user to the database.
    (asyncHandler( async (req, res, next) => {
        const userId = course.userId ? course.userId : null;
        const estimatedTime = course.estimatedTime ? course.estimatedTime : null;
        const materialsNeeded = course.materialsNeeded ? course.materialsNeeded : null;
        let newCourse;
        try {
                newCourse = await Course.create({
                    title: course.title,
                    description: course.description,
                    userId: userId,
                    estimatedTime: estimatedTime,
                    materialsNeeded: materialsNeeded,
                }).then( data => {
                    // Set the status to 201 Created and end the response.
                    res.status(201)
                    .location(`/api/courses/${data.id}`)
                    .end();
                });
        } catch(error) {
            if(error.name === "SequelizeValidationError") {
                newCourse = await Course.build(req.body);
                res.status(500).send({ 
                    errors: error.errors, 
                });
              } else {
                throw error;
              } 
        }
    }))(req, res);
  });

module.exports = router;