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
const port = process.env.port || 8080;

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3"
  },
  useNullAsDefault: true
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
      expires: 600000
    }
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
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "s3cr3t", (error, decodedToken) => {
      if (error) {
        res.locals.authenticated = false;
        next();
      } else {
        res.locals.authenticated = true;
        next();
      }
    });
  } else {
    res.locals.authenticated = false;
    next();
  }
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

app.post("/add-song", upload.single("song"), function(req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});

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

app.use(middlewares.notFound);
app.listen(app.get("port"), () =>
  console.log(`Server running on ${app.get("port")}`)
);
