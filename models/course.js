'use strict';

const Sequelize = require('sequelize');
module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}
    Course.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: '"Title" is required'
                }
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: '"Email address" is required'
                }
            }
        },
        userId: Sequelize.INTEGER,
        estimatedTime: Sequelize.STRING,
        materialsNeeded: Sequelize.STRING,
    }, { sequelize });

    Course.associate = (models) => {
        Course.belongsTo(models.User, { foreignKey: 
            {
                fieldName: 'userId',
                allowNull: false,
            } 
        });
    };

    return Course;
};