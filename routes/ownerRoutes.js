const express = require('express');
const router = express.Router();
const isAuthenticated = require('../utils/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getOwnerData } = require('../utils/utils');

// Route for owner profile page (protected)
router.get('/owner-profile', isAuthenticated, async (req, res) => {
    const ownderData = await getOwnerData(global.db, req.session.userId);
    res.render('index', {
        title: 'Owner Profile - WoofWalk',
        currentPage: 'owner-profile',
        body: 'owner/owner-profile'
    });
});

module.exports = router;