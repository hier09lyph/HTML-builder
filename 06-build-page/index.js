const fs = require("fs").promises;
const path = require("path");

const projectBuildFolder = path.join(__dirname, "project-dist");
const sourceAssets = path.join(__dirname, "assets");
const projectBuildAssets = path.join(projectBuildFolder, "assets");
const fileTemplate = path.join(__dirname, "template.html");
const fileBuildHtml = path.join(projectBuildFolder, "index.html");
const sourceComponents = path.join(__dirname, "components");
const sourceStyles = path.join(__dirname, "styles");

async function buildPage() {
  const destinationExists = await fs
    .stat(projectBuildFolder)
    .then((stats) => stats.isDirectory())
    .catch(() => console.log("Create folder 'project-dist'"));

  if (destinationExists) {
    await removeFolder(projectBuildFolder);
  }

  await fs.mkdir(projectBuildFolder);

  await buildIndexHtml();
  await buildStylesCss();
  await copyFolder(sourceAssets, projectBuildAssets);
  console.log("Copy folder 'assets'");
}

async function buildIndexHtml() {
  await fs.copyFile(fileTemplate, fileBuildHtml);

  const files = await fs.readdir(sourceComponents);

  for (const file of files) {
    const content = await fs.readFile(
      path.join(sourceComponents, file),
      "utf-8"
    );
    const fileContent = await fs.readFile(fileBuildHtml, "utf-8");
    const basename = path.basename(file, path.extname(file));
    const replacedContent = fileContent.replace(`{{${basename}}}`, content);
    await fs.writeFile(fileBuildHtml, replacedContent, "utf-8");
  }
  return console.log("Page layout complete");
}

async function buildStylesCss() {
  try {
    await fs.writeFile(path.join(projectBuildFolder, "style.css"), "");

    const files = await fs.readdir(sourceStyles);
    const stylesArr = await Promise.all(
      files.map(async (file) => {
        const fileBuildHtml = path.join(sourceStyles, file);
        const extension = path.extname(file);

        const stats = await fs.stat(fileBuildHtml, (err, stats) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        if (!stats.isFile() || extension !== ".css") {
          return "";
        }

        const content = fs.readFile(fileBuildHtml, "utf-8");
        return content;
      })
    );

    await fs.appendFile(
      path.join(projectBuildFolder, "style.css"),
      stylesArr.join("")
    );

    console.log("Page styles complete");
  } catch (err) {
    console.error("Error bundling styles:", err);
  }
}

buildPage();

async function removeFolder(folderPath) {
  const files = await fs.readdir(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileStats = await fs.stat(filePath);
    if (fileStats.isDirectory()) {
      await removeFolder(filePath);
    } else {
      await fs.unlink(filePath);
    }
  }

  await fs.rmdir(folderPath);
}

async function copyFolder(sourceFolder, destinationFolder) {
  const destinationExists = await fs
    .stat(destinationFolder)
    .then((stats) => stats.isDirectory())
    .catch(() => false);

  if (destinationExists) {
    await removeFolder(destinationFolder);
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
      await fs.copyFile(sourceFilePath, destinationFilePath);
    }

    if (!stats.isFile()) {
      const sourceFolderPath = path.join(sourceFolder, file);
      const destinationFolderPath = path.join(destinationFolder, file);
      copyFolder(sourceFolderPath, destinationFolderPath);
    }
  }
}
