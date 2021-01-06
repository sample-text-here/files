// the main server

// load the modules
const express = require("express"); // the actual server
const compression = require("compression"); // make the webpage s p e e e d
const app = express(); // create the app
app.use(compression());
app.use(express.static("/public"));

const listener = app.listen(3000);

const io = require("socket.io")(listener);
