//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const app = express();

const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

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
    })
    .post((req, res) => {
        User.findOne({ email: req.body.username }).then((foundUser) => {
            if (foundUser === null) {
                res.send("User not found");
            } else {
                bcrypt.compare(req.body.password, foundUser.password, (err, result) => {
                    if (err) {
                        res.send(err);
                    } else {
                        if (result == true) {
                            res.render("secrets");
                        } else {
                            res.send("Incorrect password");
                        }
                    }
                });
            }
        })
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            if (err) {
                res.send(err);
            } else {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });
                newUser.save().then((newUser) => {
                    if (newUser == null) {
                        res.send("Error creating new user");
                    } else {
                        res.render("secrets");
                    }
                });
            }
        })
    });