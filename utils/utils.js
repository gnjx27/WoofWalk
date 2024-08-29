const bcrypt = require('bcrypt');
const validator = require('validator');
const fs = require('fs');

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

// Server-side validation - second layer of validation
// Middleware to validate user input
const validateUserInput = (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validate username
    if (!username || username.length < 5) {
        return res.status(400).send("Username must be at least 5 characters long");
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
        return res.status(400).send("Invalid email format");
    }

    // Validate password
    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).send("Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers");
    }

    // Validate confirm password
    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
    }

    next();
};

// Middleware to hash password
const hashPassword = (req, res, next) => {
    const { password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send("Internal server error");
        }
        req.body.password_hash = hash;
        next();
    });
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
                    setDefaultUserPhoto(db);
                    resolve(this.lastID);
                }
            }
        );
    });
};

const insertWalker = (db, userId) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO walker (user_id) VALUES (?)', [userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const insertDog = (db, userId) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO dog (user_id) VALUES (?)', [userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const getWalkerData = (db, userId) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM walker WHERE user_id = ?',
            [userId],
            function(err, walkerData) {
                if (err) {
                    reject(err);
                } else {
                    resolve(walkerData);
                }
            }
        );
    });
};


const getWalkerReviews = (db, walkerId) => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM review WHERE walker_id = ?', [walkerId], (err, reviews) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(reviews);
                }
            }
        )
    });
}

const getUserData = (db, userId) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM user WHERE user_id = ?',
            [userId],
            function(err, userData) {
                if (err) {
                    reject(err);
                } else {
                    resolve(userData);
                }
            }
        );
    });
};

function setDefaultUserPhoto(db) {
    fs.readFile('public/assets/default-user-photo.png', (err, data) => {
        if (err) {
            console.log("Error reading default user photo");
        } else {
            db.run('UPDATE user SET user_photo = ? WHERE user_photo = "No photo"', [data], (err) => {
                if (err) {
                    console.log("Error updating default user photo");
                } else {
                    console.log("Default user photo updated");
                }
            });
        }
    });
}

const getDogData = (db, userId) => {
    return new Promise ((resolve, reject) => {
        db.get('SELECT * FROM dog WHERE user_id = ?', [userId], (err, dogData) => {
            if (err) {
                reject(err);
            } else {
                resolve(dogData);
            }
        });
    });
};

const getWalkers = (db) => {
    return new Promise ((resolve, reject) => {
        db.all('SELECT * FROM walker', (err, walkers) => {
            if (err) {
                reject(err);
            } else {
                resolve(walkers);
            }
        });
    });
}

const getUsers = (db) => {
    return new Promise ((resolve, reject) => {
        db.all('SELECT * FROM user', (err, users) => {
            if (err) {
                reject(err);
            } else {
                resolve(users);
            }
        });
    });
};

const getReviews = (db) => {
    return new Promise ((resolve, reject) => {
        db.all('SELECT * FROM review', (err, reviews) => {
            if (err) {
                reject(err);
            } else {
                resolve(reviews);
            }
        });
    });
};

const getBookings = (db, userId) => {
    return new Promise ((resolve, reject) => {
        db.all('SELECT * FROM booking WHERE user_id = ?', [userId], (err, bookings) => {
            if (err) {
                reject(err);
            } else {
                resolve(bookings);
            }
        });
    });
};

module.exports = { 
    checkExistingUser, 
    validateUserInput, 
    hashPassword, 
    insertUser, 
    insertWalker, 
    getWalkerData, 
    getWalkerReviews, 
    getUserData,
    setDefaultUserPhoto,
    getDogData,
    insertDog,
    getWalkers,
    getUsers,
    getReviews,
    getBookings
};