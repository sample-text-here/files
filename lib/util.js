// a bunch of random, short programs

const path = require("path");

function getIp() {
  return require("ip").address();
}

function abs(file) {
  return path.join(__dirname, "..", file);
}

module.exports = { getIp, abs };
