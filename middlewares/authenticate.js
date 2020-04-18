const jwt = require("jsonwebtoken");

module.exports = function authenticate(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "s3cr3t", (error, decodedToken) => {
      if (error) {
        return res.status(401).json("Authentication error");
      } else {
        req.decoded = decodedToken;
        req.user = decodedToken.payload;
        next();
      }
    });
  } else {
    return res.status(403).json("No token provided");
  }
};
