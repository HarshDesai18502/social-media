const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let decodedToken;

  try {
    const token = req.headers.authorization.split(" ")[1];
    decodedToken = jwt.verify(token, "mySecret");
  } catch (err) {
    err.statusCode = 500;
    err.message = "Invalid Token";
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not Authnticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
