const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home - WoofWalk',
        currentPage: 'home',
        body: 'homepage'
    });
});

router.get('/booking', (req, res) => {
    res.render('index', {
        title: 'Booking - WoofWalk',
        currentPage: 'booking',
        body: 'booking'
    });
});

router.get('/account', (req, res) => {
    res.render('index', {
        title: 'Account - WoofWalk',
        currentPage: 'account',
        body: 'account'
    });
});

router.get('/about', (req, res) => {
    res.render('index', {
        title: 'About - WoofWalk',
        currentPage: 'about',
        body: 'about'
    });
});

router.post('/getUsers', (req, res) => {
    res.send(req.body);
});

module.exports = router;
