// imports
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { checkExistingUser, validateUserInput, hashPassword, insertUser } = require('../utils/utils');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const isAuthenticated = require('../utils/auth');

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'woofwalk.project@outlook.com',
        pass: 'aspgroup80'
    }
});

router.use((req, res, next) => {
    if (req.session.userId) {
        global.db.get('SELECT * FROM user WHERE user_id = ?', [req.session.userId], (err, row) => {
            if (err) {
                console.error(err);
            }
            res.locals.user = row;
            next();
        });
    } else {
        res.locals.user = null;
        next();
    }
});

// Route for home page
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home - WoofWalk',
        currentPage: 'home',
        body: 'homepage'
    });
});

// Route for booking page
router.get('/booking', isAuthenticated, (req, res) => {
    res.render('index', {
        title: 'Booking - WoofWalk',
        currentPage: 'booking',
        body: 'booking'
    });
});

// Route for account page
router.get('/account', isAuthenticated, (req, res) => {
    res.render('index', {
        title: 'Account - WoofWalk',
        currentPage: 'account',
        body: 'account'
    });
});

// Route for about page
router.get('/about', isAuthenticated, (req, res) => {
    res.render('index', {
        title: 'About - WoofWalk',
        currentPage: 'about',
        body: 'about'
    });
});

// Route for sign-in page
router.get('/sign-in', (req, res) => {
    res.render('index', {
        title: 'Sign In - WoofWalk',
        currentPage: 'sign-in',
        body: 'sign-in'
    });
});

// Route for sign-up page
router.get('/sign-up', (req, res) => {
    res.render('index', {
        title: 'Sign Up - WoofWalk',
        currentPage: 'sign-up',
        body: 'sign-up'
    });
});

// Route for forgot-password page
router.get("/forgot-password", (req, res) => {
    res.render("index", {
        title: "Forgot Password - WoofWalk",
        currentPage: "sign-in",
        body: "forgot-password"
    })
});

// Route for reset-password page
router.get("/reset-password/:token", (req, res) => {
    const token = req.params.token;
    // validate one time token
    if (req.session.OTT && req.session.OTT === token) {
        delete req.session.OTT;
        res.render('index', {
            title: "Reset Password - WoofWalk",
            currentPage: "sign-in",
            body: "reset-password"
        });
    }
    else {
        return res.status(403).send("This link is invalid or has already been used")
    }
});

// Handle sign-up form submission
router.post('/sign-up', validateUserInput, hashPassword, async (req, res) => {
    try {
        const { username, email, password_hash, accountType } = req.body;
        const existingUser = await checkExistingUser(global.db, email, username);
        if (existingUser) {
            return res.status(400).send('Email or username already in use');
        }
        await insertUser(global.db, username, email, password_hash, accountType);
        res.status(201).redirect('/sign-in');
    } catch (error) {
        return res.status(500).send('Error creating account');
    }
});

// Handle sign-in form submission
router.post('/sign-in', async (req, res) => {
    const { username, password, rememberMe } = req.body; // Added rememberMe
    try {
        const user = await new Promise((resolve, reject) => {
            global.db.get('SELECT * FROM user WHERE username = ?', [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        if (user && await bcrypt.compare(password, user.password_hash)) {
            req.session.userId = user.user_id;
            
            // Set cookie expiration based on 'Remember Me' checkbox
            if (rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            } else {
                req.session.cookie.expires = false; // Session expires when the browser closes
            }

            res.redirect('/');
        } else {
            return res.status(400).send('Invalid username or password');
        }
    } catch (error) {
        res.status(500).send('Error signing in');
    }
});

// Handle forgot-password form submission
router.post("/forgot-password", async (req, res) => {
    const email = req.body.email;
    // Check if user exists in database
    const existingUser = await checkExistingUser(global.db, email, "none");
    if (!existingUser) {
        return res.status(400).send(`User not registered`);
    }
    // User exists in database, send one time link to reset password to user's email
    const token = uuidv4();
    req.session.OTT = token;
    const OTTLink = `http://localhost:3000/reset-password/${token}`;
    const mailDetails = {
        from: "woofwalk.project@outlook.com",
        to: email,
        subject: "Password Reset",
        text: `Click the one-time link to reset your password: ${OTTLink}`  
    };
    transporter.sendMail(mailDetails, (err, info) => {
        if (err) {
            return res.status(500).send("Error sending email to user");
        }
        else {
            console.log("One time link sent to user's email");
            res.redirect("/sign-in");
        }
    });
});

router.post("/reset-password", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const existingUser = await checkExistingUser(global.db, email, "none");
    if (!existingUser) {
        return res.status(400).send("User not registered");
    }
    const hashedPassword = await hashPassword(password);
    global.db.run(
        "UPDATE user SET password_hash = ? WHERE email = ?",
        [hashedPassword, email],
        (err) => {
            if (err) {
                return res.status(500).send("Error updating password");
            }
            else {
                console.log("Password changed successfully");
                res.redirect("/sign-in");
            }
        }
    );
});

// Route for logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

module.exports = router;
