const fs = require("fs").promises;
const path = require("path");

const destinationPath = path.join(__dirname, "project-dist");

async function makePage(){
  
  const destinationExists = await fs.stat(destinationPath)
    .then(stats => stats.isDirectory())
    .catch(() => console.log("Create folder 'project-dist'"));

  if (destinationExists) {
    await removeDir(destinationPath);
  }

  await fs.mkdir(destinationPath);

  await replaceModule()
  await bundleCss()
  await copyFolder(sourceAssets, destinationAssets)
  await console.log("Copy folder 'assets'")
}

async function replaceModule() {

  
  const fileTemplate = path.join(__dirname, "template.html");
  const filePath = path.join(destinationPath, "index.html");
  
  await fs.copyFile(fileTemplate, filePath);

  const sourcePath = path.join(__dirname, "components");
  const files = await fs.readdir(sourcePath);

  for (const file of files) {
    const content = await fs.readFile(path.join(sourcePath, file), "utf-8");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const basename = path.basename(file, path.extname(file));
    const replacedContent = fileContent.replace(`{{${basename}}}`, content);
    await fs.writeFile(filePath, replacedContent, "utf-8");
  }
  return console.log('Page layout complete')
}



const sourcePath = path.join(__dirname, "styles");


async function bundleCss() {
  const sourcePath = path.join(__dirname, "styles");
  try {
    await fs.writeFile(path.join(destinationPath, "style.css"), "");

    const files = await fs.readdir(sourcePath);
    const stylesArr = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(sourcePath, file);
        const extension = path.extname(file);

        const stats = await fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        if (!stats.isFile() || extension !== ".css") {
          return "";
        }

        const content = fs.readFile(filePath, "utf-8");
        return content;
      })
    );

    await fs.appendFile(
      path.join(destinationPath, "style.css"),
      stylesArr.join("")
    );

    console.log("Styles bundled successfully");
  } catch (err) {
    console.error("Error bundling styles:", err);
  }
}

makePage()


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

const sourceAssets = path.join(__dirname, "assets");
const destinationAssets = path.join(destinationPath, "assets");

async function copyFolder(sourceFolder, destinationFolder) {
  const destinationExists = await fs.stat(destinationFolder)
    .then(stats => stats.isDirectory())
    .catch(() => false);

  if (destinationExists) {
    await removeDir(destinationFolder);
  }

  await fs.mkdir(destinationFolder);

  const files = await fs.readdir(sourceFolder);
  for (const file of files) {
    const filePath = path.join(sourceFolder, file);
    const stats = await fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    if (stats.isFile()) {
      const sourceFilePath = path.join(sourceFolder, file);
    const destinationFilePath = path.join(destinationFolder, file);
    await fs.copyFile(sourceFilePath, destinationFilePath);;
    }

    if (!stats.isFile()) {
      const sourceFolderPath = path.join(sourceFolder, file);
      const destinationFolderPath = path.join(destinationFolder, file);
      copyFolder(sourceFolderPath, destinationFolderPath)
    }
    
  }
}
