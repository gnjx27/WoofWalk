// Imports
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const sqlite3 = require('sqlite3').verbose();
const routes = require('./routes/routes');
const ownerRoutes = require('./routes/ownerRoutes');
const walkerRoutes = require('./routes/walkerRoutes');
const { setDefaultUserPhoto } = require('./utils/utils');

const port = 3000;
const app = express();

// Session setup for user authentication
app.use(session({
    secret: 'woofwalk',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Global database connection
global.db = new sqlite3.Database('./database.db', function (err) {
    if (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    } else {
        console.log('Database connected');
        global.db.run('PRAGMA foreign_keys = ON');
        // set default walker photos
        setDefaultUserPhoto(global.db);
    }
});

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(cookieParser());
app.use('/', routes);
app.use('/owner', ownerRoutes);
app.use('/walker', walkerRoutes);

// Start server
app.listen(port, () => {
    const link = `\x1b[34m\x1b[4mhttp://localhost:${port}\x1b[0m`;
    console.log(`WoofWalk running at ${link}`);
});
