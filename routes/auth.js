const express = require('express');

const router = express.Router();

const {
  registerValidatior,
  updateValidatior,
  loginValidatior,
  uniqueFieldChecker
} = require('../validation/userValidator');

const {
  registerUser,
  login,
  updateUser,
  deleteUser
} = require('../controllers/auth');
const isAuth = require('../middleware/isAuth');

// create user
router.post(
  '/register-user',
  registerValidatior,
  uniqueFieldChecker,
  registerUser
);

// login
router.post('/login', loginValidatior, login);

// update user
router.put(
  '/update-user',
  isAuth,
  updateValidatior,
  uniqueFieldChecker,
  updateUser
);

// delete user
router.delete('/delete-user', isAuth, deleteUser);

module.exports = router;
