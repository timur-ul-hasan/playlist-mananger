const user = require("../user");

const homePage = (req, res) => {
  return res.render("index", {
    user: req.session.user ? req.session.user : null,
    intro:
      "Welcome to ACME Inc., please login to view our employees. If you do not have an account, please register for one."
  });
};

const logout = (req, res) => {
  req.session.destroy(function(err) {
    res.clearCookie("jwt");
    res.redirect("/");
  });
};

const registerPage = (req, res) => {
  res.render("register");
};

const register = (req, res) => {
  user
    .insertUser(req.body.name, req.body.username, req.body.password)
    .then(response => {
      if (response) {
        req.session.user = response[0];
        return res.redirect("/");
      } else {
        return res.render("register", {
          error: "User already registered."
        });
      }
    })
    .catch(error => {
      return res.redirect("/register");
    });
};

const loginPage = (req, res) => {
  res.render("login");
};

const login = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  user
    .checkUser(username, password)
    .then(response => {
      if (response) {
        req.session.user = response;
        return res.redirect("/");
      } else {
        return res.render("login", {
          error:
            'Incorrect login details. Maybe try to <a href="/register">Register</a>.'
        });
      }
    })
    .catch(error => {
      return res.redirect("/register");
    });
};

const profilePage = (req, res) => {
  return res.render("profile", {
    user: req.decoded
  });
};

const accountPage = (req, res) => {
  const { knex } = req.app.locals;
  knex
    .select("id", "username", "name")
    .from("users")
    .then(users => {
      return res.render("account", {
        users
      });
    });
};

const userPage = (req, res) => {
  const { knex } = req.app.locals;
  const { userId } = req.params;
  knex("users")
    .join("playlists", "users.id", "=", "playlists.user_id")
    .select(
      "users.id as user_id",
      "username",
      "users.name as fullname",
      "playlists.name as playlistName",
      "playlists.id as playlistId"
    )
    .where("users.id", userId)
    .then(users => {
      return res.render("userpage", {
        users
      });
    });
};

const aboutPage = (req, res) => {
  return res.render("about");
};

const contactPage = (req, res) => {
  return res.render("contact");
};
module.exports = {
  homePage,
  logout,
  registerPage,
  register,
  loginPage,
  login,
  profilePage,
  accountPage,
  aboutPage,
  contactPage,
  userPage
};
