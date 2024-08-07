function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        global.db.get('SELECT * FROM user WHERE user_id = ?', [req.session.userId], (err, user) => {
            if (err) {
                return res.status(500).send('Database error');
            }
            if (user) {
                req.user = user; // Attach user info to request
                next();
            } else {
                res.status(401).send('Unauthorized: User not found');
            }
        });
    } else {
        res.redirect('/sign-in?message=Please+log+in+first'); // Redirect to login page with message
    }
}

module.exports = isAuthenticated;
