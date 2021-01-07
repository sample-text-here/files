const { abs } = require(__dirname + "/util.js");
const { fromVideo, fromImage } = require(abs("./lib/thumb"));
const path = require("path");
const fs = require("fs");

const files = {};
const maxStrLength = 50;

function icon(file) {
  if (file.folder) return "folder.png";
  if (file.type === "video")
    return path.basename(fromVideo(file.name) || "error.png");
  if (file.type === "image")
    return path.basename(fromImage(file.name) || "error.png");
  if (file.type === "text") {
    if (Object.hasOwnProperty.call(files, file.name)) return files[file.name];
    let fd = fs.openSync(abs("./files/" + file.name)),
      buf = Buffer.alloc(maxStrLength);
    let actualRead = fs.readSync(fd, buf, 0, maxStrLength, 0);
    fs.closeSync(fd);
    let str = buf.toString("utf8", 0, actualRead) + (true ? "..." : "");
    files[file.name] = str;
    return str;
  }
  return "error.png";
}

function name(file) {
  return path.basename(file.name);
}

function url(file) {
  if (file.folder) {
    return "/tree/" + file.name;
  }
  return "/view/" + file.name;
}

module.exports = (files) => ({
  files: files.map((file) => ({
    icon: icon(file),
    name: name(file),
    url: url(file),
    isText: file.type === "text",
  })),
});
