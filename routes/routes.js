// imports
const express = require('express');

const router = express.Router();

router.get("/", (req, res) => {
    res.render("index.ejs", {
        partial: "homepage"
    });
});

router.post("/getUsers", (req, res) => {
    res.send(req.body)
});

module.exports = router;