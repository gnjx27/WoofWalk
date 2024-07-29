const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const routes = require('./routes/routes');
const sqlite3 = require('sqlite3').verbose();
const fileUpload = require('express-fileupload');

const port = 3000;
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(fileUpload());
app.set('view engine', 'ejs');

// Session setup for user authentication
app.use(session({
    secret: 'woofwalk',
    resave: false,
    saveUninitialized: false
}));

// Global database connection
global.db = new sqlite3.Database('./database.db', function (err) {
    if (err) {
        console.error(err);
        process.exit(1);
    } else {
        console.log('Database connected');
        global.db.run('PRAGMA foreign_keys = ON');
    }
});

// Routes
app.use(routes);

// Start server
app.listen(port, () => {
    const link = `\x1b[34m\x1b[4mhttp://localhost:${port}\x1b[0m`;
    console.log(`WoofWalk running at ${link}`);
});
