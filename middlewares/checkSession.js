const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    // Authorization: Bearer token
    jwt.verify(token, "s3cr3t", (error, decodedToken) => {
      if (error) {
        next();
      } else {
        return res.redirect("/");
      }
    });
  } else {
    next();
  }
};
