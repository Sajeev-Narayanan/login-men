const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const filestore = require("session-file-store")(session);
const path = require('path');
const cookieparser = require('cookie-parser');

const app = express();


let meg=""

app.use(express.static('public'))
app.set("views",(path.join(__dirname,'/views')))


app.use(
  session({
    name: "session-1",
    secret: "thisIsOurSecret",
    saveUninitialized: false,
    resave: false,
    store: new filestore(),
  })
);
app.use(cookieparser());

const user = {
  email: "sanju@gmail.com",
  password: "pass1234",
};

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

const auth = (req, res, next) => {
  if (!req.cookies.username) {
    let err = new Error("You are not authenticated");
    res.setHeader("WWW-Authenticate", "Basic");
    err.status = 401;
    res.redirect("/login");
    next(err);
  }
  next();
};

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
  res.render("pages/login",{message:meg});
  }
});

app.post("/login", (req, res) => {
  const { mail, password } = req.body;

  if (mail === user.email && password === user.password) {
    req.session.user = mail;
    res.cookie("username",mail,{
      maxAge:2*60*60*1000,
      httpOnly:true,});
    console.log(req.cookies.username)
    // req.session.name = user.name;
    res.redirect("/");
  }else{
    meg="Enter valide user name or password"
    res.redirect("/login");
  }
});

app.use(auth);

app.get("/", (req, res) => {
  if (req.session.user || req.cookies.username) {
    res.render("pages/index");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.clearCookie("username")
    res.redirect("/login");
  });
});

app.listen(5000, () => {
  console.log("The server is stsrted..");
});
