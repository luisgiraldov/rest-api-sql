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
    //     res.status(500).json({
    //     error: error.message
    //   });
        const err = new Error(error.message);
        err.status = 500;
        next(err);
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
  ], (req, res, next) => {

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
                        userId: course.userId,
                        estimatedTime: estimatedTime,
                        materialsNeeded: materialsNeeded
                    },   
                }).then( data => {
                    const  user = data[0];
                    const created = data[1];
                    if(created){
                        // Set the status to 201 Created and end the response.
                        res.status(201)
                        .location(`/api/courses/${user.id}`)
                        .end();
                    } else {
                        const err = new Error("Course already exists!");
                        err.status = 409;
                        next(err);   
                    } 
                });
        } catch(error) {
            if(error.name === "SequelizeValidationError") {
                // newCourse = await Course.build(req.body);
                // res.status(400).send({ 
                //     errors: error.errors, 
                // });
                const err = new Error(error.errors);
                err.status = 400;
                next(err);
              } else {
                throw error;
              } 
        }
    }))(req, res, next);
  });

  //Route to update Course
  router.put('/courses/:id', asyncHandler( async(req, res, next) => {
        const fieldsToUpdate = req.body;
        try {
            await Course.update(
                {...fieldsToUpdate},
                {where: {
                            id: {
                                [Op.eq]: req.params.id
                            }
                        }
                },
            )
            .then(course => {
                console.log("Course: " + req.params.id + " successfully updated");
                res.status(204).end();
            });
        } catch(error){
            if(error.name === "SequelizeValidationError") {
                // newCourse = await Course.build(req.body);
                // res.status(400).send({ 
                //     errors: error.errors, 
                // });
                const err = new Error(error.errors);
                err.status = 400;
                next(err);
              } else {
                throw error;
              } 
        }
  }));

  //Route to delete course
  router.delete('/courses/:id', asyncHandler( async(req, res, next) => {
    await Course.destroy({
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