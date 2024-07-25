// imports
const express = require('express');
var bodyParser = require('body-parser');
const routes = require("./routes/routes");
const sqlite3 = require('sqlite3').verbose();

const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

global.db = new sqlite3.Database('./database.db', function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys = ON");
    }
});
//testing jonathan
app.use(routes);

// nisel 
app.listen(port, () => {
    // Blue color and underline
    const link = `\x1b[34m\x1b[4mhttp://localhost:${port}\x1b[0m`;
    console.log(`WoofWalk running at ${link}`);
});