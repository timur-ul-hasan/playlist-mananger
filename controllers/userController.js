const user = require("../user");

const homePage = (req, res) => {
  return res.render("index", {
    user: req.session.user ? req.session.user : null,
    intro:
      "Welcome to ACME Inc., please login to view our employees. If you do not have an account, please register for one."
  });
};


const logout = (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
};

const registerPage = (req, res) => {
  res.render("register");
}

const register = (req, res) => {
  user
    .insertUser(req.body.username, req.body.password)
    .then(user => {
      if (user) {
        req.session.user = user[0];
        return res.redirect("/profile");
      } else {
        return res.render("register", {
          error: "User already registered."
        });
      }
    })
    .catch(error => {
      console.log(error);
      return res.redirect("/register");
    });
}

const loginPage = (req, res) => {
  res.render("login");
}

const login = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  user
    .checkUser(username, password)
    .then(response => {
      if (response) {
        req.session.user = response;
        const token = user.createToken(response.username);
        res.cookie("jwt", token);
        return res.redirect("/profile");
      } else {
        return res.render("login", {
          error:
            'Incorrect login details. Maybe try to <a href="/register">Register</a>.'
        });
      }
    })
    .catch(error => {
      console.log(error);
      return res.redirect("/register");
    });
}

const profilePage = (req, res) => {
  return res.render("profile", {
    user: req.decoded
  });
}

module.exports = {
  homePage,
  logout,
  registerPage,
  register,
  loginPage,
  login,
  profilePage
};
