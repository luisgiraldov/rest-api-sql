const express = require('express');
const router = express.Router();

//GET home page
router.get('/', (req, res) => {
    res.redirect('/api');
});

// setup a friendly greeting for the root route
router.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the REST API project!',
    });
});

module.exports = router;