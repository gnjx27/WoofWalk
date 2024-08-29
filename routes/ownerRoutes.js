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
    const dogData = await getDogData(global.db, req.session.userId);
    const userData = await getUserData(global.db, req.session.userId);
    res.render('index', {
        title: 'Edit Owner Profile - WoofWalk',
        currentPage: 'edit-owner-profile',
        body: 'owner/edit-owner-profile',
        userData: userData,
        dogData: dogData
    });
});

// Handle update owner profile
router.post('/update-owner-profile', isAuthenticated, async (req, res) => {
    const userData = await getUserData(global.db, req.session.userId);
    const { username, email, dog_name, dog_breed, dog_size, dog_age, special_needs, dog_remark } = req.body;
    // console.log(dog_size, dog_age);
    var userPhoto;
    try {
        userPhoto = req.files.userPhoto.data;
    } catch {
        userPhoto = userData.user_photo;
    }
    const userQuery = 'UPDATE user SET username = ?, email = ?, user_photo = ?, has_owner_profile = 1 WHERE user_id = ?';
    const dogQuery = 'UPDATE dog SET dog_name = ?, dog_breed = ?, dog_size = ?, dog_age = ?, special_needs = ?, dog_remark = ? WHERE user_id = ?';
    global.db.run(userQuery, [username, email, userPhoto, req.session.userId], (err) => {
        if (err) {
            console.log("Error updating user profile");
        } else {
            global.db.run(dogQuery, [dog_name, dog_breed, dog_size, dog_age, special_needs, dog_remark, req.session.userId], (err) => {
                if (err) {
                    console.log("Error updating dog profile");
                } else {
                    res.redirect('/owner/owner-profile');
                }
            });
        }
    });
});

module.exports = router;
