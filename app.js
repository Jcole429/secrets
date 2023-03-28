//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");

const app = express();

const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});