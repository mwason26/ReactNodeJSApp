const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');

const router = express.Router();

router.get("/", (req, res) => res.send("Welcome To User Page"));

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  let errors = [];

  if (!name || !email || !password || !confirmPassword) {
    errors.push({
      msg: "Please fill in all fields"
    });
  }

  if (password !== confirmPassword) {
    errors.push({
      msd: "Passwords do not match"
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: "Password should be at least 6 characters"
    });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      confirmPassword
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({
          msg: "Email already registered"
        });
        res.render("register", {
          errors,
          name,
          email,
          password,
          confirmPassword
        });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password
        });

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            newUser.password = hash;

            newUser
              .save()
              .then(user => {
                req.flash('success_msg', 'You are now registered and can log in!');
                res.redirect("/users/login");
              })
              .catch(err => console.log(err));
          })
        );

        console.log(newUser);
        
      }
    });
  }
});

router.post('/login', (req, res, next) => {
  
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
    
  });
  
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });

module.exports = router;
