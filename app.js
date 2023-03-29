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
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

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
    googleId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
    console.log("Serializing user");
    done(null, user.id);
});

passport.deserializeUser((user, done) => {
    console.log("Deserializing user");
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, (accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({ googleId: profile.id }, (err, user) => {
        return cb(err, user);
    });
}
));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/auth/google")
    .get(passport.authenticate("google", { scope: ["profile"] }));

app.route("/auth/google/secrets")
    .get(passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
        console.log("Successful google authentication, redirect to secrets");
        res.redirect("/secrets");
    });

app.route("/login")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            console.log("User is already authenticated. Redirect to /secrets");
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
                console.log({ err });
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
                console.log({ err });
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
            console.log("User is authenticated");
            res.render("secrets");
        } else {
            console.log("User is not authenticated");
            res.redirect("/login");
        }
    });

app.route("/logout")
    .get((req, res) => {
        req.logout((err) => {
            if (err) {
                console.log({ err });
                res.redirect("/");
            } else {
                res.redirect("/");
            }
        });
    });