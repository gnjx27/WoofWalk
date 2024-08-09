// imports
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../utils/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getWalkerData, getWalkerReviews, getUserData } = require('../utils/utils');

// Route for displaying the walker profile page (protected)
router.get('/walker-profile', isAuthenticated, async (req, res) => {
    const walkerData = await getWalkerData(global.db, req.session.userId);
    const reviews = await getWalkerReviews(global.db, walkerData.walker_id);
    res.render('index', {
        title: 'Walker Profile - WoofWalk',
        currentPage: 'walker-profile',
        body: 'walker/walker-profile',
        walkerData: walkerData,
        reviews: reviews
    });
});

// Route for editing the walker profile page (protected)
router.get('/edit-walker-profile', isAuthenticated, async (req, res) => {
    const walkerData = await getWalkerData(global.db, req.session.userId);
    res.render('index', {
        title: 'Edit Walker Profile - WoofWalk',
        currentPage: 'edit-walker-profile',
        body: 'walker/edit-walker-profile',
        walkerData: walkerData
    });
});

module.exports = router;

