
const fs = require("fs").promises;
const path = require("path");

const sourcePath = path.join(__dirname, "files");
const destinationPath = path.join(__dirname, "files-copy");

async function copyFolder() {
  const destinationExists = await fs.stat(destinationPath)
    .then(stats => stats.isDirectory())
    .catch(() => console.log("Create folder 'files-copy'"));

  if (destinationExists) {
    await removeDir(destinationPath);
  }

  await fs.mkdir(destinationPath);

  const files = await fs.readdir(sourcePath);
  for (const file of files) {
    const filePath = path.join(sourcePath, file);
    const stats = await fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    if (stats.isFile()) {
      const sourceFilePath = path.join(sourcePath, file);
    const destinationFilePath = path.join(destinationPath, file);
    await fs.copyFile(sourceFilePath, destinationFilePath);;
    }
    
  }
}

copyFolder();

async function removeDir(dirPath) {
  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStats = await fs.stat(filePath);
    if (fileStats.isDirectory()) {
      await removeDir(filePath);
    } else {
      await fs.unlink(filePath);
    }
  }

  await fs.rmdir(dirPath);
}