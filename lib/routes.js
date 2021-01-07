const { abs } = require(__dirname + "/../lib/util.js");

const fs = require("fs");
const express = require("express");
const hbs = require("hbs");
const compression = require("compression");
const app = express();
const maxAge = 60 * 1000;

const files = fs.readdirSync(abs("files"));
app.set("view engine", "html");
app.engine("html", hbs.__express);

hbs.registerPartials(abs("./views/parts"), function (err) {});

app.use(compression());
app.use(express.static(abs("public"))); //, {maxAge: cacheTime});
app.use("/view", express.static(abs("files"), { maxAge }));

app.get("/tree*", (req, res) => {
  res.render("index.html", { files });
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

module.exports = listener;
