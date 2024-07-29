const bcrypt = require('bcrypt');
const validator = require('validator');

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

module.exports = { checkExistingUser, hashPassword, insertUser };