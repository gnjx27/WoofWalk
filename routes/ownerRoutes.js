const express = require('express');
const router = express.Router();
const isAuthenticated = require('../utils/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getOwnerData } = require('../utils/utils');

// Route for owner profile page (protected)
router.get('/owner-profile', isAuthenticated, async (req, res) => {
    try {
        const ownerData = await getOwnerData(global.db, req.session.userId);
        res.render('index', {
            title: 'Owner Profile - WoofWalk',
            currentPage: 'owner-profile',
            body: 'owner/owner-profile',
            ownerData: ownerData // Passing ownerData to the view
        });
    } catch (err) {
        res.status(500).send('Error fetching owner data: ' + err.message);
    }
});

// Route for editing the owner profile page (protected)
router.get('/edit-owner-profile', isAuthenticated, async (req, res) => {
    // const ownerData = await getownerData(global.db, req.session.userId);
    res.render('index', {
        title: 'Edit Owner Profile - WoofWalk',
        currentPage: 'edit-owner-profile',
        body: 'owner/edit-owner-profile',
        // ownerData: ownerData
    });
});

// Route for owner profile page (protected)
// router.get('/owner-profile', isAuthenticated, async (req, res) => {
//     try {
//         let ownerData = await getOwnerData(global.db, req.session.userId);
//         if (!ownerData) {
//             ownerData = {
//                 dog_name: 'No Name',
//                 owner_location: 'Unknown',
//                 breed: 'Unknown',
//                 age: 0,
//                 bio: 'No bio added...',
//             };
//         }
//         res.render('index', {
//             title: 'Owner Profile - WoofWalk',
//             currentPage: 'owner-profile',
//             body: 'owner/owner-profile',
//             ownerData: ownerData // Passing ownerData to the view
//         });
//     } catch (err) {
//         res.status(500).send('Error fetching owner data: ' + err.message);
//     }
// });

// Route for editing owner profile page (protected)
// router.get('/edit-owner-profile', isAuthenticated, async (req, res) => {
//     try {
//         let ownerData = await getOwnerData(global.db, req.session.userId);
//         if (!ownerData) {
//             ownerData = {
//                 dog_name: 'No Name',
//                 owner_location: 'Unknown',
//                 dog_breed: 'Unknown',
//                 dog_age: 0,
//                 dog_size: 'Unknown',
//                 dog_remark: 'None',
//                 dog_photo: '/path/to/default/photo.jpg'
//             };
//         }
//         res.render('owner/edit-owner-profile', {
//             title: 'Edit Owner Profile - WoofWalk',
//             currentPage: 'edit-owner-profile',
//             ownerData: ownerData
//         });
//     } catch (err) {
//         res.status(500).send('Error fetching owner data: ' + err.message);
//     }
// });

module.exports = router;
