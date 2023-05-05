const User = require('../models/user');
const {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema
} = require('./userSchema');

// To check weather the email and userName filed is unique or not
const uniqueFieldChecker = async (req, res, next) => {
  const user = await User.findOne({
    $or: [{ userName: req.body.userName }, { email: req.body.email }]
  });

  if (user.email === req.body.email) {
    return res
      .status(400)
      .json({ error: 'User with this email already Exist.' });
  }

  if (user.userName === req.body.userName) {
    return res
      .status(400)
      .json({ error: 'User with this userName already Exist.' });
  }

  return next();
};

// validation when user register
const registerValidatior = async (req, res, next) => {
  const { error } = registerUserSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  return next();
};

// validation while upadting
const updateValidatior = async (req, res, next) => {
  const result = updateUserSchema.validate(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }

  return next();
};

// Validation for Login
const loginValidatior = async (req, res, next) => {
  const result = loginUserSchema.validate(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }

  return next();
};

module.exports = {
  registerValidatior,
  updateValidatior,
  uniqueFieldChecker,
  loginValidatior
};
