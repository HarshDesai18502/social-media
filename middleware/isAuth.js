const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let decodedToken;

  try {
    const token = req.headers.authorization.split(' ')[1];
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // err.statusCode = 500;
    // err.message = "Invalid Token";
    // throw err;
    return res.status(401).send({
      error: 'Invalid Token'
    });
  }

  if (!decodedToken) {
    const error = new Error('Not Authnticated');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  return next();
};
