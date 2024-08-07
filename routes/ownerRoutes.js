const express = require('express');
const router = express.Router();
const isAuthenticated = require('../utils/auth');

// Route for owner profile page (protected)
router.get('/owner-profile', isAuthenticated, (req, res) => {
    res.render('index', {
        title: 'Owner Profile - WoofWalk',
        currentPage: 'owner-profile',
        body: 'owner-profile'
    });
});

module.exports = router;