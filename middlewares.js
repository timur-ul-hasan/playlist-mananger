const jwt = require("jsonwebtoken");

function getIDAsInteger(req, res, next) {
  const id = +req.params.id;
  if (Number.isInteger(id)) {
    next();
  } else {
    return res.status(400).json("ID must be an integer");
  }
}

function authenticate(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    // Authorization: Bearer token
    jwt.verify(token, "s3cr3t", (error, decodedToken) => {
      if (error) {
        return res.redirect("/login");
      } else {
        req.decoded = decodedToken;
        next();
      }
    });
  } else {
    return res.redirect("/login");
  }
}

module.exports = {
  getIDAsInteger,
  authenticate
};
