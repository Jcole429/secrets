//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model("User", userSchema);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/login")
    .get((req, res) => {
        res.render("login");
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save().then((newUser) => {
            if (newUser === null) {
                res.send("Error creating new user");
            } else {
                res.render("secrets");
            }
        });
    });