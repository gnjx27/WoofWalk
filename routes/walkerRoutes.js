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
    const userData = await getUserData(global.db, req.session.userId);
    res.render('index', {
        title: 'Walker Profile - WoofWalk',
        currentPage: 'walker-profile',
        body: 'walker/walker-profile',
        walkerData: walkerData,
        reviews: reviews,
        username: userData.username
    });
});

// Route for creating a walker profile (protected)
router.post('/walker-profile', isAuthenticated, upload.single('walker_photo'), (req, res) => {
    const { walker_quote, walker_bio, walker_skills, walker_contact, base_price } = req.body;
    const walker_photo = req.file ? req.file.filename : '';

    const walker = {
        walker_photo,
        walker_quote,
        walker_bio,
        walker_skills,
        walker_contact,
        base_price,
        user_id: req.session.userId
    };

    global.db.run('INSERT INTO walker (walker_photo, walker_quote, walker_bio, walker_skills, walker_contact, base_price, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [walker.walker_photo, walker.walker_quote, walker.walker_bio, walker.walker_skills, walker.walker_contact, walker.base_price, walker.user_id],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/walker/walker-profile');
        }
    );
});

// Route for editing the walker profile page (protected)
router.get('/edit-walker-profile', isAuthenticated, (req, res) => {
    // Fetch existing walker data from the database
    global.db.get('SELECT * FROM walker WHERE user_id = ?', [req.session.userId], (err, walker) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('index', {
            title: 'Edit Walker Profile - WoofWalk',
            currentPage: 'edit-walker-profile',
            body: 'walker/edit-walker-profile',
            walker: walker
        });
    });
});

// Route for updating the walker profile (protected)
router.post('/edit-walker-profile', isAuthenticated, upload.single('walker_photo'), (req, res) => {
    const { walker_quote, walker_bio, walker_skills, walker_contact, base_price } = req.body;
    const walker_photo = req.file ? req.file.filename : '';

    const updates = {
        walker_quote,
        walker_bio,
        walker_skills,
        walker_contact,
        base_price,
        walker_photo: walker_photo || null
    };

    const updateKeys = Object.keys(updates).filter(key => updates[key] !== null && updates[key] !== undefined);
    const updateValues = updateKeys.map(key => updates[key]);
    const updateSql = updateKeys.map(key => `${key} = ?`).join(', ');

    global.db.run(`UPDATE walker SET ${updateSql} WHERE user_id = ?`, [...updateValues, req.session.userId], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/walker/walker-profile');
    });
});

module.exports = router;
