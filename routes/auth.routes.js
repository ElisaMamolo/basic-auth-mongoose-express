// routes/auth.routes.js

const { Router } = require("express");
const router = new Router();
const User = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const saltRounds = 10;
const mongoose = require("mongoose"); // <== has to be added

//GET user profile page after creation of it
router.get("/user-profile", (req, res) => res.render("users/user-profile"));

// GET route ==> to display the signup form to users
router.get("/signup", (req, res) => res.render("auth/signup"));
// POST route ==> to process form data

router.post("/signup", (req, res, next) => {
  //console.log("The form data: ", req.body);

  const { username, email, password } = req.body;
  // make sure users fill all mandatory fields:
  if (!username || !email || !password) {
    res.render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });
    return;
  }

  // make sure passwords are strong:
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        // username: username
        username,
        email,
        // passwordHash => this is the key from the User model
        //     ^
        //     |            |--> this is placeholder (how we named returning value from the previous method (.hash()))
        passwordHash: hashedPassword,
      });
    })
    .then((userFromDB) => {
      // console.log("Newly created user is: ", userFromDB);
      res.redirect("user-profile");
    })
    .catch((error) => {
      // copy the following if-else statement
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage:
            "Username and email need to be unique. Either username or email is already used.",
        });
      } else {
        //next means go to next middelware
        next(error);
      }
    }); // close .catch()
}); // close router.post()

module.exports = router;