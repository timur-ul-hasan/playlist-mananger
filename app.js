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
const app = express();
require("dotenv").config();
require("./setup.js");
const port = process.env.port || 8080;
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
  .get(middlewares.checkSession,userController.registerPage)
  .post(userController.register);
app
  .route("/login")
  .get(middlewares.checkSession, userController.loginPage)
  .post(userController.login);

app.get("/profile", middlewares.authenticate, userController.profilePage);

app.get("/logout", userController.logout);

app.use(middlewares.notFound);
app.listen(app.get("port"), () =>
  console.log(`Server running on ${app.get("port")}`)
);
