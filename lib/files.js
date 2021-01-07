const { abs } = require(__dirname + "/../lib/util.js");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
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
    const types = (mime.lookup(name) || "application/octet-stream").split("/");
    this.type = types[0];
    this.subtype = types[1];
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
    if (dirTree.length === 0) return this.sort(this.files.flat());
    return this.sort(
      dirTree
        .reduce((a, i) => {
          let filtered = a.items.filter((j) => j.folder && j.name === i);
          if (filtered.length === 0) return new Folder("", []);
          return filtered[0];
        }, this.files)
        .flat()
    );
  }

  sort(items) {
    let folders = [];
    items = items.filter((item) => {
      if (!item.folder) return true;
      folders.push(item);
      return false;
    });
    items.unshift(...folders);
    return items;
  }
}

async function read() {
  return new FileSystem(await getFiles(toRead));
}

module.exports = read;
