const fs = require("fs");
const express = require("express");
const hbs = require("hbs");
const compression = require("compression");
const app = express();
const maxAge = 60 * 1000;

module.exports = (abs) => {
  const files = fs.readdirSync(abs("files"));
  app.set("view engine", "html");
  app.engine("html", hbs.__express);

  hbs.registerPartials(abs("./views/parts"), function (err) {});

  app.use(compression());
  app.use(express.static(abs("public"))); //, {maxAge: cacheTime});
  app.use("/files", express.static(abs("files"), { maxAge }));

  app.get("/", (req, res) => {
    res.render("index.html", { files });
  });

  const listener = app.listen(3000, () => {
    console.log("ur server is running at http://localhost:3000");
  });

  require("./socket.js")(listener);
};
