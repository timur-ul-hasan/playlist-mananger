const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const user = require("./user");
const serveStatic = require("serve-static");
const handlebars = require("express-handlebars");
const middlewares = require("./middlewares");
const app = express();
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();
require("./setup.js");
const port = process.env.PORT || 3000;
const usersApiController = require("./apis/userController");
const playlistsApiController = require("./apis/playlistController.js");
const jsonParser = bodyParser.json();

const sqliteOptions = {
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3",
  },
  useNullAsDefault: true,
};
const knex = require("knex")(sqliteOptions);

const KnexSessionStore = require("connect-session-knex")(session);
const store = new KnexSessionStore({
  knex,
});

app.locals.knex = knex;
app.set("port", port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
});

app.use(serveStatic(path.join(__dirname, "public")));

app.get("/api/playlists", playlistsApiController.playlists);

app
  .route("/api/add-playlist")
  .post(
    middlewares.authenticate,
    jsonParser,
    playlistsApiController.createPlaylist
  );

app
  .route("/api/edit-playlist/:playlistId")
  .post(
    middlewares.authenticate,
    jsonParser,
    playlistsApiController.editPlaylist
  );

app.delete(
  "/api/delete-playlist/:playlistId",
  playlistsApiController.deletePlaylist
);

app
  .route("/api/playlist/:playlistId")
  .get(playlistsApiController.playlistSongs);

app.post(
  "/api/add-song/:playlistId",
  upload.single("song"),
  playlistsApiController.addSong
);

app.delete("/delete-song/:songId", playlistsApiController.deleteSong);

app
  .route("/api/user/playlists")
  .get(jsonParser, middlewares.authenticate, usersApiController.userPlaylists);

app.route("/api/login").post(jsonParser, usersApiController.login);
app.route("/api/logout").post(jsonParser, usersApiController.logout);
app.route("/api/register").post(jsonParser, usersApiController.register);
app
  .route("/api/user")
  .get(jsonParser, middlewares.authenticate, usersApiController.userInfo);
app
  .route("/api/show")
  .get(
    jsonParser,
    middlewares.authenticate,
    usersApiController.basicAccountInfo
  );

app.use(middlewares.notFound);
app.listen(app.get("port"), () =>
  console.log(`Server running on ${app.get("port")}`)
);
