const Joi = require('joi');

const postSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  location: Joi.string().optional()
});

const postUpdateSchema = Joi.object({
  title: Joi.string(),
  content: Joi.string(),
  location: Joi.string().optional()
});

module.exports = { postSchema, postUpdateSchema };
