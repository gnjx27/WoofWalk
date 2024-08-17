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

router.post('/update-walker-profile', async (req, res) => {
    const walkerData = await getWalkerData(global.db, req.session.userId);
    var walkerPhoto;
    try {
        walkerPhoto = req.files.walkerPhoto.data;
    } catch {
        walkerPhoto = walkerData.walker_photo;
    }
    const walker_quote = req.body.walker_quote;
    const walker_bio = req.body.walker_bio;
    const walker_skills = req.body.walker_skills;
    const base_price = req.body.base_price;
    const walker_location = req.body.walker_location;
    const walker_contact = req.body.walker_contact;
    const walker_id = walkerData.walker_id;
    const walkerQuery = "UPDATE walker SET walker_photo = ?, walker_quote = ?, walker_bio = ?, walker_skills = ?, base_price = ?, walker_location = ?, walker_contact = ? WHERE walker_id = ?";
    const username = req.body.username;
    const email = req.body.email;
    const userQuery = "UPDATE user SET username = ?, email = ?, has_walker_profile = 1 WHERE user_id = ?";
    global.db.run(walkerQuery, [walkerPhoto, walker_quote, walker_bio, walker_skills, base_price, walker_location, walker_contact, walker_id], (err) => {
        if (err) {
            return res.status(500).send("Error updating walker info");
        }
        global.db.run(userQuery, [username, email, req.session.userId], (err) => {
            if (err) {
                return res.status(500).send("Error updating user info");
            } else {
                res.redirect('/walker/walker-profile');
            }
        });
    });
});

router.get('/get-walker-photo', async (req, res) => {
    const walkerData = await getWalkerData(global.db, req.session.userId);
    const walkerPhoto = walkerData.walker_photo;
    res.set('Content-Type', 'image/jpg'); // Set appropriate content type (e.g., image/png, image/jpeg)
    res.end(walkerPhoto, 'binary');
}); 

module.exports = router;

