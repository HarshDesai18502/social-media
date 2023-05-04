const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("../models/post");
const User = require("../models/user");

// To create a User
const registerUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { name, email, password } = req.body;

  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPw,
    });
    res.status(201).json({
      message: "User Created Successfully",
      user
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Problem in creating user";
    }
    next(err);
  }
};

// For Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("Wrong Email or Password");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong Email or Password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "mySecret",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      token,
      userId: user._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong";
    }
    next(err);
  }
};

// To delete a user
const deleteUser = async (req, res, next) => {
  const id = req.userId;

  try {
    await Post.deleteMany({ creator: id });
    await User.findByIdAndDelete(id);
    res.status(200).json({
      message: "User Deleted Successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong";
    }
    next(err);
  }
};

module.exports = { registerUser, login, deleteUser };
