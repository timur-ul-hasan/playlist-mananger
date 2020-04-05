const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if(req.cookies.user_sid && req.session.user) {
    next();
  } else {
    return res.redirect("/login");
  }
};


