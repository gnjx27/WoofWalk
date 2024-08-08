// imports
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { checkExistingUser, validateUserInput, hashPassword, insertUser, insertWalker } = require('../utils/utils');
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

// Route for home page (accessible to everyone)
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home - WoofWalk',
        currentPage: 'home',
        body: 'homepage'
    });
});

// Route for booking page (protected)
router.get('/booking', isAuthenticated, (req, res) => {
    res.render('index', {
        title: 'Booking - WoofWalk',
        currentPage: 'booking',
        body: 'booking'
    });
});

// Route for about page
router.get('/about', (req, res) => {
    res.render('index', {
        title: 'About - WoofWalk',
        currentPage: 'about',
        body: 'about'
    });
});

// Route for contact page
router.get('/contact-us', (req, res) => {
    res.render('index', {
        title: 'Contact Us - WoofWalk',
        currentPage: 'contact-us',
        body: 'contact-us'
    });
});

// Route for success page
router.get('/success', (req, res) => {
    res.render('success');
});

// Route for handling contact form submission
router.post('/contact-us', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate the inputs (simple example)
    if (!name || !email || !subject || !message) {
        return res.status(400).send('All fields are required.');
    }

    // Set up email details
    const mailOptions = {
        from: 'woofwalk.project@outlook.com',
        to: 'woofwalk.project@outlook.com',
        subject: `Contact Form Submission: ${subject}`,
        text: `
            Name: ${name}
            Email: ${email}
            Subject: ${subject}
            Message: ${message}
        `
    };

    // Send email
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
            return res.status(500).send('Error sending email.');
        } else {
            console.log('Email sent:', info.response);
            res.redirect('/success');
        }
    });
});

// Route for sign-in page
router.get('/sign-in', (req, res) => {
    const message = req.query.message;
    res.render('index', {
        title: 'Sign In - WoofWalk',
        currentPage: 'sign-in',
        body: 'sign-in',
        message: message
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
        const userId = await insertUser(global.db, username, email, password_hash, accountType);
        await insertWalker(global.db, userId);
        res.status(201).redirect('/sign-in');
    } catch (error) {
        console.log(error.message)
        return res.status(500).send('Error creating account');
    }
});

// Handle sign-in form submission
router.post('/sign-in', async (req, res) => {
    const { username, password, rememberMe } = req.body;
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

            // Redirect based on profile completion
            if (user.account_type === 'owner' && !user.has_dog_profile) {
                return res.redirect('/owner/owner-profile');
            }
            if (user.account_type === 'walker' && !user.has_walker_profile) {
                return res.redirect('/walker/walker-profile');``
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

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = router;
