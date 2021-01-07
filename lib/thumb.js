const { abs } = require(__dirname + "/util.js");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("ffmpeg-static"));
const sharp = require("sharp");

let id = -1;
const cache = {};

function fromVideo(path) {
  if (Object.hasOwnProperty.call(cache, path)) return cache[path];
  try {
    const fname = abs("./public/thumbs/thumb" + id + ".jpg");
    const tmp = abs("./public/thumbs/tmp"+id+".jpg");
    ffmpeg(abs("./files/" + path))
      .seekInput(0)
      .outputOptions("-vframes 1")
      .on("end", function () {
        sharp(tmp, { failOnError: true })
          .resize(200, 200)
          .jpeg({ quality: 60 })
          .toFile(fname)
          .then(()=>{
            fs.unlinkSync(tmp);
          })
      })
      .save(tmp);
    cache[path] = fname;
    id++;
    return fname;
  } catch (err) {
    require("fs").writeFileSync("log.txt", err);
    return null;
  }
}

function fromImage(path) {
  if (Object.hasOwnProperty.call(cache, path)) return cache[path];
  try {
    const fname = abs("./public/thumbs/thumb" + id + ".jpg");
    sharp(abs("./files/" + path), { failOnError: true })
      .resize(200, 200)
      .jpeg({ quality: 60 })
      .toFile(fname);
    id++;
    return fname;
  } catch (err) {
    return null;
  }
}

module.exports = { fromVideo, fromImage };
