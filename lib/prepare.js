// prepares various items for viewing

const { abs } = require(__dirname + "/util.js");
const { fromVideo, fromImage } = require(abs("./lib/thumb"));
const path = require("path");
const fs = require("fs");

const files = {};
const maxStrLength = 50,
  maxNameLength = 15;

function icon(file) {
  if (file.folder) return { isFolder: true, isIcon: true };
  if (file.type === "text") {
    try {
      if (Object.hasOwnProperty.call(files, file.name))
        return { icon: files[file.name], isText: true };
      let fd = fs.openSync(abs("./files/" + file.name)),
        buf = Buffer.alloc(maxStrLength);
      let actualRead = fs.readSync(fd, buf, 0, maxStrLength, 0);
      fs.closeSync(fd);
      let str = trunc(buf.toString("utf8", 0, actualRead), maxStrLength);
      files[file.name] = str;
      return { icon: str, isText: true };
    } catch (err) {
      return { icon: file.name, isText: true };
    }
  }
  if (file.type === "audio") return { icon: "icons/audio.png", isIcon: true };
  if (file.type === "video")
    return (
      { icon: path.basename(fromVideo(file.name)) } || {
        icon: "icons/error.png",
      }
    );
  if (file.type === "image")
    return (
      { icon: path.basename(fromImage(file.name)) } || {
        icon: "icons/error.png",
      }
    );

  return { icon: "icons/unknown.png", isIcon: true };
}

function name(file) {
  return trunc(path.basename(file.name), maxNameLength);
}

function trunc(str, maxLen) {
  return str.length > maxLen ? str.substr(0, maxLen) + "..." : str;
}

function url(file) {
  if (file.folder) {
    return "/tree/" + file.name;
  }
  return "/view/" + file.name;
}

module.exports = (files, p) => {
  let parsed = files
    .map((file) => ({
      ...icon(file),
      name: name(file),
      url: url(file),
    }))
    .reduce(
      (a, i) => {
        if (i.isFolder) {
          a.folders.push(i);
        } else {
          a.files.push(i);
        }
        return a;
      },
      { files: [], folders: [] }
    );
  p = p.split("/").filter((i) => i);
  if (p.length > 0) {
    p.pop();
    parsed.folders.unshift({
      toParent: true,
      isIcon: true,
      url: "/" + p.join("/"),
      name: "..",
    });
  }
  return parsed;
};
