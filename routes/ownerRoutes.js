const express = require('express');
const router = express.Router();
const isAuthenticated = require('../utils/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getDogData, getUserData } = require('../utils/utils');

// Route for owner profile page (protected)
router.get('/owner-profile', isAuthenticated, async (req, res) => {
    const dogData = await getDogData(global.db, req.session.userId);
    const userData = await getUserData(global.db, req.session.userId);
    res.render('index', {
        title: 'Owner Profile - WoofWalk',
        currentPage: 'owner-profile',
        body: 'owner/owner-profile',
        userData: userData,
        dogData: dogData
    });
});

// Route for editing the owner profile page (protected)
router.get('/edit-owner-profile', isAuthenticated, async (req, res) => {
    // const ownerData = await getownerData(global.db, req.session.userId);
    res.render('index', {
        title: 'Edit Owner Profile - WoofWalk',
        currentPage: 'edit-owner-profile',
        body: 'owner/edit-owner-profile',
    });
});

module.exports = router;
