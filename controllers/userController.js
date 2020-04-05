const logout = (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
};

module.exports = {
  logout
};
