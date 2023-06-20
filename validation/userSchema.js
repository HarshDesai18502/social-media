const Joi = require('joi');

const baseSchema = Joi.object({
  name: Joi.string().min(2),
  userName: Joi.string().alphanum().min(3),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  dateOfBirth: Joi.date().min('1900-01-01').max('now'),
  status: Joi.string().valid('private', 'public'),
  description: Joi.string().max(40).optional()
});

const registerUserSchema = baseSchema.options({
  presence: 'required'
});

const updateUserSchema = baseSchema.keys({});

const loginUserSchema = Joi.object({
  userName: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().required()
}).or('userName', 'email');

module.exports = { registerUserSchema, updateUserSchema, loginUserSchema };
