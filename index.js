const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const user = require("./user");
const serveStatic = require("serve-static");
const handlebars = require("express-handlebars");
const middlewares = require("./middlewares");
const userController = require("./controllers/userController");
const playlistsController = require("./controllers/playlistController");
const app = express();
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();
require("./setup.js");
const port = process.env.PORT || 3000;

const sqliteOptions = {
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3"
  },
  useNullAsDefault: true
};
const knex = require("knex")(sqliteOptions);

const KnexSessionStore = require("connect-session-knex")(session);
const store = new KnexSessionStore({
  knex
});

app.locals.knex = knex;

app.set("port", port);
app.set("view engine", "handlebars");
app.set("views", `${__dirname}/components`);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    key: "user_sid",
    secret: "s3cr3t",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 1000 * 60 * 60 * 24 * 7
    },
    store
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post("/uploadfile", upload.single("myFile"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  knex("songs")
    .insert({
      name: file.filename,
      url: file.path.substring(7)
    })
    .then(song => {
      res.send(song);
    });
});

/* Global Middleware to conditional render stuff in views. */
app.use((req, res, next) => {
  console.log(req.session.user, req.cookies);
  if (req.cookies.user_sid && req.session.user) {
    res.locals.authenticated = true;
    res.locals.user = req.session.user;
  } else {
    res.locals.authenticated = false;
    res.clearCookie("user_sid");
  }
  next();
});

app.use(serveStatic(path.join(__dirname, "public")));
//Sets our app to use the handlebars engine
app.engine(
  ".hbs",
  handlebars({
    layoutsDir: `${__dirname}/components`,
    extname: ".hbs",
    defaultLayout: "layout",
    partialsDir: `${__dirname}/components/partials`
  })
);
app.set("view engine", ".hbs"); //Sets handlebars configurations (we will go through them later on)

app.get("/", userController.homePage);

app
  .route("/register")
  .get(middlewares.checkSession, userController.registerPage)
  .post(userController.register);
app
  .route("/login")
  .get(middlewares.checkSession, userController.loginPage)
  .post(userController.login);

app.get("/profile", middlewares.authenticate, userController.profilePage);

app.get("/logout", userController.logout);
app.get("/playlists", playlistsController.listAllPlaylist);
app
  .route("/add-playlist")
  .get(middlewares.authenticate, playlistsController.addPlaylistPage)
  .post(middlewares.authenticate, playlistsController.createPlaylist);

app
  .route("/playlist/:playlistId")
  .get(middlewares.authenticate, playlistsController.playListPage);

app.route("/add-song").post(upload.single("song"), playlistsController.addSong);

/* Accounts routes */
app.get("/accounts", userController.accountPage);

app.use(middlewares.notFound);
app.listen(app.get("port"), () =>
  console.log(`Server running on ${app.get("port")}`)
);
