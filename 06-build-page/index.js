const fs = require("fs").promises;
const path = require("path");

async function replaceModule() {

  
  const fileTemplate = path.join(__dirname, "template.html");
  const destinationPath = path.join(__dirname, "project-dist");
  const filePath = path.join(destinationPath, "index.html");
  await fs.mkdir(destinationPath)
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
}

replaceModule();
