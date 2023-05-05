const Joi = require('joi');

const registerUserSchema = Joi.object({
  name: Joi.string().required().min(2),
  userName: Joi.string().alphanum().required().min(3),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  dateOfBirth: Joi.date().min('1900-01-01').max('now').required(),
  status: Joi.string().required().valid('private', 'public'),
  description: Joi.string().max(40).optional()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2),
  userName: Joi.string().alphanum().min(3),
  email: Joi.string().email(),
  dateOfBirth: Joi.date().min('1900-01-01').max('now'),
  status: Joi.string().valid('private', 'public'),
  description: Joi.string().max(40).optional()
});

const loginUserSchema = Joi.object({
  userName: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().required()
}).or('userName', 'email');

module.exports = { registerUserSchema, updateUserSchema,loginUserSchema };
