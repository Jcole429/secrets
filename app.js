//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/login")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.redirect("/secrets");
        } else {
            res.render("login");
        }
    })
    .post((req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.passport,
        });
        req.login(user, (err) => {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        });
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        User.register({ username: req.body.username }, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                })
            }
        })
    });

app.route("/secrets")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render("secrets");
        } else {
            res.redirect("/login");
        }
    });

app.route("/logout")
    .get((req, res) => {
        req.logout((err) => {
            if (err) {
                console.log(err);
                res.redirect("/");
            } else {
                res.redirect("/");
            }
        });
    });