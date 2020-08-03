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
        res.status(404).json({
            message: "Course not found"
        });
    }
}));



module.exports = router;