// setup
const { abs } = require(__dirname + "/util.js");

const fs = require("fs");
const express = require("express");
const hbs = require("hbs");
const compression = require("compression");
const minify = require("express-minify");
const read = require(abs("./lib/files.js"));
const prep = require(abs("./lib/prepare.js"));
const cookieParser = require("cookie-parser");
const app = express();
const maxAge = 5 * 60 * 1000;
let files;
read().then((vfs) => {
  files = vfs;
});

// load handlebars
app.set("view engine", "html");
app.engine("html", hbs.__express);
hbs.registerPartials(abs("./views/partials"), (err) => {});

// compress files
app.use(compression());
app.use(minify());
app.use(cookieParser());

// clean and setup cache
const thumbDir = abs("public/thumbs");
if (fs.existsSync(thumbDir)) fs.rmdirSync(thumbDir, { recursive: true });
fs.mkdirSync(thumbDir);
app.use(express.static(thumbDir, { maxAge }));

// static files
app.use(
  express.static(abs("public"), {
    maxAge: process.env.NODE_ENV === "production" ? maxAge : 0,
  })
);
app.use("/view", express.static(abs("files"), { maxAge }));

// main routes
app.get("/", (req, res) => {
  res.redirect("/tree");
});

app.get("/tree*", (req, res, next) => {
  if (!files) {
    res.render("oops.html", { error: "loading the files" });
    return;
  }
  let type = (req.cookies || {}).display === "tiles";
  let p = req.url.slice(6);
  let items = prep(files.readFolder(p), p);
  res.render(
    type ? "tiles.html" : "list.html",
    type ? items : {items: [...items.folders, ...items.files]},
  );
});

app.get("/prefs", (req, res, next) => {
  let c = req.cookies || {},
    obj = {};
  obj.display = c.display === "tiles";
  obj.display = obj.display?
  {name:"list", description:"(denser information)"}:
  {name:"tiles", description:"(shows previews)"};
  res.render("prefs.html", obj);
});

app.get("/set/:key/:value", (req, res, next) => {
  res.cookie(req.params.key, req.params.value);
  res.redirect("/prefs");
});

app.get("*", (req, res) => {
  res.status(404);
  let error = "cant find that url";
  if (/^\/view/.test(req.url)) error = "cant find that file";
  res.render("oops.html", { error });
});

const listener = app.listen(3000, () => {
  console.log("ur server is running at http://localhost:3000");
});

setInterval(() => {
  read().then((vfs) => {
    files = vfs;
  });
}, 1000 * 5);

module.exports = { listener };
