const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const User = require('../models/user');
const logger = require('../logger');


// To create a User
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, userName, status, dateOfBirth } = req.body;

    /* if user has not uploaded any photo then by default he will get this default profile picture,
     and if file is attached then he will get that photo */
    let profilePic = process.env.DEFAULT_PROFILE_PHOTO;
    if (req.file) {
      profilePic = req.file.path;
    }

    const hashedPw = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPw,
      profilePic,
      userName,
      status,
      dateOfBirth
    });
    res.status(201).json({
      message: 'User Created Successfully',
      user
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Problem in creating user';
    }
    next(err);
  }
};

// For Login   -- User can do login either with the email or userName
const login = async (req, res, next) => {
  try {
    const { email, userName, password } = req.body;

    const user = await User.findOne({ $or: [{ userName }, { email }] });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.status(200).json({
      token,
      userId: user._id.toString()
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Something went wrong';
    }
    return next(err);
  }
};

// To delete the image from the folder
const clearImage = (filePath) => {
  let a = filePath;
  a = path.join(__dirname, '..', filePath);
  fs.unlink(a, () =>
    logger.customerLogger.log('error', 'Error in deleting the image from file')
  );
};

// To update a user
const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }
    let profilePic;
    if (req.file) {
      profilePic = req.file.path;
      user = Object.assign(user, req.body, profilePic);
    }
    user = Object.assign(user, req.body);
    await user.save();
    return res.status(200).json({
      message: 'User updated successfully.'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Something went wrong';
    }
    return next(err);
  }
};

// To delete a user
const deleteUser = async (req, res, next) => {
  try {
    const id = req.userId;
    await Post.deleteMany({ creator: id });
    const user = await User.findById(id);

    if (user.profilePic !== process.env.DEFAULT_PROFILE_PHOTO) {
      clearImage(user.profilePic);
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({
      message: 'User Deleted Successfully'
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Something went wrong';
    }
    next(err);
  }
};

module.exports = { registerUser, login, updateUser, deleteUser };
