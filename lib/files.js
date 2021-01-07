const { abs } = require(__dirname + "/../lib/util.js");
const fs = require("fs");
const path = require("path");
const toRead = abs("./files/");

async function getFiles(dir) {
  const files = [];
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      files.push(new Folder(res.substr(toRead.length), await getFiles(res)));
    } else {
      files.push(new File(res.substr(toRead.length)));
    }
  }
  return files;
}

class File {
  constructor(name) {
    this.name = name;
    this.folder = false;
  }
}

class Folder {
  constructor(name, items) {
    this.name = name;
    this.items = items;
    this.folder = true;
  }

  flat() {
    return this.items.map((i) => (i.folder ? new Folder(i.name, []) : i));
  }
}

class FileSystem {
  constructor(files) {
    this.files = new Folder("", files);
  }

  readFolder(path) {
    let dirTree = path.split("/").filter((i) => i);
    if (dirTree.length === 0) return new Folder("", []);
    return dirTree
      .reduce((a, i) => {
        let filtered = a.items.filter((j) => j.folder && j.name === i);
        if (filtered.length === 0) return new Folder("", []);
        return filtered[0];
      }, this.files)
      .flat();
  }
}

async function read() {
  return new FileSystem(await getFiles(toRead));
}

module.exports = read;
