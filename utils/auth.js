// middleware/auth.js
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        global.db.get('SELECT * FROM user WHERE user_id = ?', [req.session.userId], (err, user) => {
            if (err) {
                return res.status(500).send('Database error');
            }
            req.user = user; // Attach user info to request
            next();
        });
    } else {
        req.user = null; // No user logged in
        next();
    }
}

module.exports = isAuthenticated;
