const { postSchema } = require('./postSchema');

const postValidation = async (req, res, next) => {
  const result = postSchema.validate(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }

  return next();
};

module.exports = { postValidation };
