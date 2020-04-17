const user = require("../user");

const homePage = (req, res) => {
  return res.render("index", {
    user: req.session.user ? req.session.user : null,
    intro:
      "Welcome to ACME Inc., please login to view our employees. If you do not have an account, please register for one.",
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
  if (req.body.password != req.body.comPassword) {
    return res.render("register", {
      error: "Password are not same",
      data: req.body,
    });
  } else {
    user
      .insertUser(req.body.name, req.body.username, req.body.password)
      .then((response) => {
        if (response) {
          req.session.user = response;
          return res.redirect("/");
        } else {
          return res.render("register", {
            error: "This Username is already taken",
            data: req.body,
          });
        }
      })
      .catch((error) => {
        return res.render("register", {
          error: "This Username is already taken",
          data: req.body,
        });
      });
  }
};

const loginPage = (req, res) => {
  res.render("login");
};

const login = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  return user
    .checkUser(username, password)
    .then((response) => {
      if (response) {
        console.log(response);
        const token = user.createToken(response.username);
        res.cookie("jwt", token);
        res.append("Content-Type", "*/*");
        res.status(200).end();
        // res.json({
        //   jwt: token,
        // });
      } else {
        return res.json({
          error: "Unauthenticated.",
        });
      }
    })
    .catch((error) => {
      return res.json({
        error: "Unauthenticated.",
      });
    });
};

const accountPage = (req, res) => {
  const { knex } = req.app.locals;
  knex
    .select("id", "username", "name")
    .from("users")
    .where("status", "public")
    .then((users) => {
      return res.render("account", {
        users,
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
    .then((users) => {
      return res.render("userpage", {
        users,
        fullname: users.length ? users[0].fullname : "",
        fill: users.length ? users[0].fullname : false,
      });
    });
};
const userPlaylists = (req, res) => {
  const { knex } = req.app.locals;
  knex("users")
    .join("playlists", "users.id", "=", "playlists.user_id")
    .select(
      "users.id as user_id",
      "playlists.id as id",
      "playlists.name as name",
      "playlists.status as status"
    )
    .where("users.id", res.locals.user.id)
    .then((playlist) => {
      return res.render("profile", {
        playlist,
      });
    });
};

const userStatus = (req, res) => {
  const { knex } = req.app.locals;
  const payload = req.body;
  knex("users")
    .where("id", res.locals.user.id)
    .update({ ...payload })
    .then((response) => {
      req.session.user = {
        ...res.locals.user,
        ...payload,
      };
      res.render("account-info", {
        public: req.session.user.status === "public",
        private: req.session.user.status === "private",
        user: req.session.user,
      });
    })
    .catch((error) => res.status(500).json(error));
};

const accountInfo = (req, res) => {
  const { knex } = req.app.locals;
  return res.render("account-info", {
    public: req.session.user.status === "public",
    private: req.session.user.status === "private",
    user: req.session.user,
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
  accountPage,
  aboutPage,
  contactPage,
  userPage,
  userPlaylists,
  accountInfo,
  userStatus,
};
