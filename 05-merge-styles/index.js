const fs = require("fs").promises;
const path = require("path");

const sourcePath = path.join(__dirname, "styles");
const destinationPath = path.join(__dirname, "project-dist");

async function bundleCss() {
  try {
    await fs.writeFile(path.join(destinationPath, "bundle.css"), "");

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
      path.join(destinationPath, "bundle.css"),
      stylesArr.join("")
    );

    console.log("Styles bundled successfully");
  } catch (err) {
    console.error("Error bundling styles:", err);
  }
}

bundleCss();
