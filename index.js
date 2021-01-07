// the main server
const { abs } = require(__dirname + "/lib/util.js");
require(abs("./lib/routes.js"))(abs);
