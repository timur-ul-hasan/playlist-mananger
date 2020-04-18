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
    res.status(200).end();
  });
};

const registerPage = (req, res) => {
  res.render("register");
};
const register = (req, res) => {
  if (req.body.password != req.body.confirmPassword) {
    return res.render("register", {
      error: "Password are not same",
      data: req.body,
    });
  } else {
    user
      .insertUser(req.body.name, req.body.username, req.body.password)
      .then((response) => {
        if (response) {
          const token = user.createToken(response);
          res.cookie("jwt", token);
          res.append("Content-Type", "*/*");
          res.status(200).end();
        } else {
          return res.status(500).json({
            error: "This Username is already taken",
          });
        }
      })
      .catch((error) => {
        return res.status(500).json({
          error: error.message,
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

  user
    .checkUser(username, password)
    .then((response) => {
      if (response) {
        const token = user.createToken(response);
        res.cookie("jwt", token);
        res.append("Content-Type", "*/*");
        res.status(200).end();
      } else {
        return res.status(500).json({
          error: "Unauthenticated.",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
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

const userInfo = (req, res) => {
  const { knex } = req.app.locals;
  knex("users")
    .leftJoin("playlists", "users.id", "=", "playlists.user_id")
    .select(
      "users.id as user_id",
      "username",
      "users.name as fullname",
      "playlists.name as playlistName",
      "playlists.id as playlistId"
    )
    .where("users.id", 1)
    .then((users) => {
      return res.json({
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
    .where("users.id", req.user.id)
    .then((playlists) => {
      return res.status(200).json(playlists);
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

const basicAccountInfo = (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  homePage,
  logout,
  registerPage,
  register,
  loginPage,
  login,
  accountPage,
  userPlaylists,
  accountInfo,
  userStatus,
  userInfo,
  basicAccountInfo,
};
