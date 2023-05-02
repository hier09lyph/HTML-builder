const fs = require("fs");
const path = require("path");

const folderPath = path.join(__dirname, "secret-folder");

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log("Files in folder 'secret-folder':");

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(err);
        return;
      }
      if (stats.isFile()) {
        const extension = path.extname(file);
        const name = path.basename(file, extension);
        const size = stats.size;
        const sizeInKb = Math.round((size / 1024) * 100) / 100;
        console.log(`${name} - ${extension.slice(1)} - ${sizeInKb}kB`);
      }
    });
  });
});
