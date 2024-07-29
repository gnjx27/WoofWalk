const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const router = express.Router();

// Route for home page
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home - WoofWalk',
        currentPage: 'home',
        body: 'homepage'
    });
});

// Route for booking page
router.get('/booking', (req, res) => {
    res.render('index', {
        title: 'Booking - WoofWalk',
        currentPage: 'booking',
        body: 'booking'
    });
});

// Route for account page
router.get('/account', (req, res) => {
    res.render('index', {
        title: 'Account - WoofWalk',
        currentPage: 'account',
        body: 'account'
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

// -----------------------------------------------------------------------

// Function to validate user input
const validateSignUp = ({ username, email, password, confirmPassword }) => {
    if (!username || !email || !password || !confirmPassword) {
        return 'All fields are required';
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    if (!validator.isEmail(email)) {
        return 'Invalid email format';
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers';
    }
    return null;
};

// Function to check if email or username already exists
const checkExistingUser = (db, email, username) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM user WHERE email = ? OR username = ?', [email, username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Function to hash password
const hashPassword = (password) => {
    return bcrypt.hash(password, 10);
};

// Function to insert user into the database
const insertUser = (db, username, email, hashedPassword, accountType) => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO user (username, email, password_hash, account_type) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, accountType],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
};

// Handle sign-up form submission
router.post('/sign-up', async (req, res) => {
    const { username, email, password, confirmPassword, accountType } = req.body;

    // Validate input
    const validationError = validateSignUp({ username, email, password, confirmPassword });
    if (validationError) {
        return res.status(400).send(validationError);
    }

    try {
        // Check if the email or username already exists
        const existingUser = await checkExistingUser(global.db, email, username);
        if (existingUser) {
            return res.status(400).send('Email or username already in use');
        }

        // Hash password and insert user
        const hashedPassword = await hashPassword(password);
        await insertUser(global.db, username, email, hashedPassword, accountType);
        
        res.redirect('/sign-in');
    } catch (error) {
        res.status(500).send('Error creating account');
    }
});

// Handle sign-in form submission
router.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await new Promise((resolve, reject) => {
            global.db.get('SELECT * FROM user WHERE email = ?', [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        if (user && await bcrypt.compare(password, user.password_hash)) {
            req.session.userId = user.user_id;
            res.redirect('/');
        } else {
            res.status(400).send('Invalid email or password');
        }
    } catch (error) {
        res.status(500).send('Error signing in');
    }
});


module.exports = router;
