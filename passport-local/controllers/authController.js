//requiring the modules
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const cors = require("cors");

//requiring the models
const User = require("../db/models.js");

//initialising express setting up bodyParser , session etc.
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//resave: 'Forces the session to be saved back to the session store,
// even if the session was never modified during the request.'

//saveUninitialized: 'Forces a session that is "uninitialized" to be saved to the store.
// A session is uninitialized when it is new but not modified.';

//If you want all the sessions to be saved in store,
// even if they don't have any modifications go with saveUninitialized: true.

// re-saving also happens only when session variables/cookies changes.
//If you want to save then always go ahead with resave: true
app.use(
  session({
    secret: "rocketcodesisawesome",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },// to be able to save cookie to browser 
  })
);
app.use(passport.initialize());
app.use(passport.session());
const corsOptions = {
  origin: ["http://localhost:4002", "http://localhost:4003"], //The routes that will access this api.
  credentials: true,
};

app.use(cors(corsOptions));

//passport strategy
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: "Incorrect email" });

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      });
    });
  })
);

//passport serialize and deserialize user
//Passport uses serializeUser function to persist user data (after successful authentication) into session.
// Function deserializeUser is used to retrieve user data from session.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

//register user
const register = async (req, res) => {
  const { email, password, name } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Server Error." });
    } else if (user) {
      return res.status(400).json({ message: "User already exist." });
    }
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Server Error" });
      }
      const newUser = new User({
        email: email,
        password: hashedPassword,
        name: name,
      });

      newUser.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Server Error" });
        }
        return res
          .status(201)
          .json({ message: "You have been registered Successfully" });
      });
    });
  });
};

//login user
const login = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
      return res.json({ message: "Login successful", user: req.user });
    });
  })(req, res, next);
};

//logout user
const logout = async (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.json({ message: "Logout successful" });
    });
  });
};

module.exports = { app, register, login, logout };
