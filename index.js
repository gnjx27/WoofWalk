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

app.use(routes);

app.listen(port, () => {
    console.log(`Woofwalk listening at port ${port}`);
});