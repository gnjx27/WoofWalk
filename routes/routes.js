// imports
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { 
    checkExistingUser, 
    validateUserInput, 
    hashPassword, 
    insertUser, 
    insertWalker, 
    getWalkerData, 
    getWalkerReviews, 
    getUserData, 
    getDogData,
    insertDog,
    getWalkers,
    getUsers,
    getReviews,
    getBookings
} = require('../utils/utils');
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

// Middleware to save logged in user details in locals
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
router.get('/booking', isAuthenticated, async (req, res) => {
    const dogData = await getDogData(global.db, req.session.userId);
    res.render('index', {
        title: 'Booking - WoofWalk',
        currentPage: 'booking',
        body: 'booking',
        dogData: dogData
    });
});

// Pass booking details to next route (book-walker)
router.post('/booking-details', isAuthenticated, async (req, res) => {
    const { location, date, time, remarks, dogSize, dogAge, timeRange } = req.body;
    global.db.run('UPDATE dog SET dog_size = ?, dog_age = ? WHERE user_id = ?', [dogSize, dogAge, req.session.userId], (err) => {
        if (err) {
            console.log("Error updating dog details");
        } else {
            req.session.bookingDetails = { location, date, time, remarks, timeRange, dogSize, dogAge };
            res.redirect('/booking-walker');
        }
    });
});

// Route for booking walker page
router.get('/booking-walker', isAuthenticated, async (req, res) => {
    const walkers = await getWalkers(global.db);
    const users = await getUsers(global.db);
    const reviews = await getReviews(global.db);
    res.render('index', {
        title: 'Search Walker - WoofWalk',
        currentPage: 'booking-walker',
        body: 'booking-walker',
        walkers: walkers,
        users: users,
        reviews: reviews
    });
});

// Route for booking summary page
router.get('/booking-summary/:walkerUserId', async (req, res) => {
    try {
        const walkerUserData = await getUserData(global.db, req.params.walkerUserId);
        const walkerData = await getWalkerData(global.db, req.params.walkerUserId);
        const dogData = await getDogData(global.db, req.session.userId);
        
        req.session.bookingDetails.dogId = dogData.dog_id;
        req.session.bookingDetails.walkerId = walkerData.walker_id;

        // Base price for the first 30 minutes
        const basePrice = parseFloat(walkerData.base_price);
        const baseDuration = 30;

        // TimeRange is the total duration of the walk in minutes
        const timeRange = parseFloat(req.session.bookingDetails.timeRange);

        // Calculate additional time in minutes (if any) beyond the first 30 minutes
        const additionalTime = Math.max(timeRange - baseDuration, 0);

        // Calculate extraCost for the additional time (charge $3 for every extra 30 minutes)
        const extraCost = Math.ceil(additionalTime / baseDuration) * 3;
        req.session.bookingDetails.extraCost = parseFloat(extraCost);

        // Calculate the total cost as base price + extra cost
        const totalCost = basePrice + req.session.bookingDetails.extraCost;
        req.session.bookingDetails.totalCost = parseFloat(totalCost);

        // Render the booking summary page
        res.render('index', {
            title: 'Booking Summary - WoofWalk',
            currentPage: 'booking-summary',
            body: 'booking-summary',
            bookingDetails: req.session.bookingDetails,
            walkerUserData: walkerUserData,
            walkerData: walkerData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching booking summary.');
    }
});

// Route for booking success page
router.get('/booking-success', (req, res) => {
    const bookingQuery = "INSERT INTO booking (dog_id, walk_location, walk_date, walk_time, duration, remarks, walk_status, user_id, walker_id) VALUES (?,?,?,?,?,?,?,?,?)";
    global.db.run(bookingQuery, 
    [
        req.session.bookingDetails.dogId,
        req.session.bookingDetails.location,
        req.session.bookingDetails.date,
        req.session.bookingDetails.time,
        req.session.bookingDetails.timeRange,
        req.session.bookingDetails.remarks,
        "pending",
        req.session.userId,
        req.session.bookingDetails.walkerId
    ], (err) => {
        if (err) {
            res.status(500).send("Error inserting booking");
        } else {
            delete req.session.bookingDetails;
            res.render('index', {
                title: 'Booking Successful - WoofWalk',
                currentPage: 'booking-success',
                body: 'booking-success'
            });
        }
    });
});

// Route for booking history page
router.get('/booking-history', async (req, res) => {
    const bookings = await getBookings(global.db, req.session.userId);
    const walkers = await getWalkers(global.db);
    const users = await getUsers(global.db);
    res.render('index', {
        title: 'Booking History - WoofWalk',
        currentPage: 'booking-history',
        body: 'booking-history',
        bookings: bookings,
        users: users,
        walkers: walkers
    });
});

// Route for booking review page
router.get('/booking-review/:userId/:walkerId', async (req, res) => {
    const userData = await getUserData(global.db, req.params.userId);
    const walkerData = await getWalkerData(global.db, req.params.walkerId);
    res.render('index', {
        title: 'Booking Review - WoofWalk',
        currentPage: 'booking-review',
        body: 'booking-review',
        userData: userData,
        walkerData: walkerData
    });
});

// Route for sending review
router.post('/booking-review/:walkerId', async (req, res) => {
    const userData = await getUserData(global.db, req.session.userId);
    const { rating, review } = req.body;
    global.db.run("INSERT INTO review (reviewer_name, star_rating, review, walker_id) VALUES (?,?,?,?)", 
        [
            userData.username,
            rating,
            review,
            req.params.walkerId
        ], (err) => {
            if (err) {
                res.status(500).send("Error inserting review");
            } else {
                res.redirect('/booking-review-success');
            }
        });
});

// Route for booking review success page
router.get('/booking-review-success', (req, res) => {
    res.render('index', {
        title: 'Review Success - WoofWalk',
        currentPage: 'booking-review-success',
        body: 'booking-review-success'
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

    // Validate all inputs
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
    const message = req.query.message;
    res.render('index', {
        title: 'Sign Up - WoofWalk',
        currentPage: 'sign-up',
        body: 'sign-up',
        message: message
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
            // return res.status(400).send('Email or username already in use');
            return res.redirect('/sign-up?message=Email+or+username+already+in+use');
        } else {
            const userId = await insertUser(global.db, username, email, password_hash, accountType);
            if (accountType == 'owner') {
                await insertDog(global.db, userId)
                res.status(201).redirect('/sign-in');
            } else {
                await insertWalker(global.db, userId);
                res.status(201).redirect('/sign-in');
            }
        }
    } catch (error) {
        return res.redirect('/sign-up?message=Error+creating+account');
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
            req.session.accountType = user.account_type;
            
            // Set cookie expiration based on 'Remember Me' checkbox
            if (rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            } else {
                // Session expires when the browser closes
                req.session.cookie.expires = false; 
            }

            // Redirect based on profile completion
            if (user.account_type === 'owner' && !user.has_owner_profile) {
                return res.redirect('/owner/owner-profile');
            }
            if (user.account_type === 'walker' && !user.has_walker_profile) {
                return res.redirect('/walker/walker-profile');
            }
            res.redirect('/');
        } else {
            res.redirect('/sign-in?message=Invalid+username+or+password');
        }
    } catch (error) {
        res.redirect('/sign-in?message=Error+signing+in')
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
        console.log("One time link sent to user's email");
        res.redirect("/sign-in?message=One+time+password+reset+link+sent+to+your+email");
    });
});

// Handle reset password
router.post("/reset-password", hashPassword,async (req, res) => {
    const { email, password_hash } = req.body;
    const existingUser = await checkExistingUser(global.db, email, "none");
    if (!existingUser) {
        return res.status(400).send("User not registered");
    }
    global.db.run(
        "UPDATE user SET password_hash = ? WHERE email = ?",
        [password_hash, email],
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

// Route to get user photo
router.get('/get-user-photo', async (req, res) => {
    const userData = await getUserData(global.db, req.session.userId);
    const userPhoto = userData.user_photo;
    res.set('Content-Type', 'image/jpg');
    res.end(userPhoto, 'binary');
});

// Route to get user photo based on id
router.get('/get-user-photo/:userId', async (req, res) => {
    const userId = req.params.userId;
    const userData = await getUserData(global.db, userId);
    const userPhoto = userData.user_photo;
    res.set('Content-Type', 'image/jpg');
    res.end(userPhoto, 'binary');
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
