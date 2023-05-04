const express = require("express");

const router = express.Router();
const { body } = require("express-validator");

const User = require("../models/user");

const { registerUser, login, deleteUser } = require("../controllers/auth");
const isAuth = require("../middleware/isAuth");

router.post(
  "/register-user",
  [
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please Enter correct name"),
    body("email")
      .isEmail()
      .withMessage("Please Enter Valid Email")
      .custom((value) => User.findOne({ email: value }).then((user) => {
          if (user) {
            throw new Error("User already Exist, select a different Email");
          }
        })),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password should be minimum of length 5"),
  ],
  registerUser
);

router.post("/login", login);

router.delete("/delete-user", isAuth, deleteUser);

module.exports = router;
