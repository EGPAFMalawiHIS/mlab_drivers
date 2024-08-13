const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const readline = require("readline");
const unzipper = require("unzipper");

class Watcher {
  constructor(folder) {
    this.folder = folder;
  }
  watch(callback) {
    var watcher = chokidar.watch(this.folder, {
      ignored: /[\/\\]\./,
      persistent: true,
    });
    console.log(
      `\x1b[33m✨️ABL 800 FLEX Driver Running - Watching dir ${this.folder} for .csv file changes\x1b[0m`
    );
    watcher.on("add", (__path__) => {
      console.log(`\x1b[33m✨️File changed: ${__path__}\x1b[0m`);
      if (__path__ && path.extname(__path__) === ".zip") {
        fs.createReadStream(__path__)
          .pipe(unzipper.Parse())
          .on("entry", function (entry) {
            const fileName = entry.path;
            const type = entry.type;
            const extName = path.extname(fileName);

            if (type === "File" && extName === ".csv") {
              console.log(`Extracting CSV file: ${fileName}`);
              fs.readFile(path.join(fileName), "utf8", (err, data) => {
                if (err) {
                  console.error("An error occurred: ", err);
                  return;
                }
                try {
                  let headers = [];
                  const readInterface = readline.createInterface({
                    input: fs.createReadStream(fileName),
                    console: false,
                  });

                  readInterface.on("line", (line) => {
                    let data = [];
                    const values = line.split(",");
                    if (headers.length === 0) {
                      headers = values;
                    } else {
                      let row = {};
                      values.forEach((value, index) => {
                        row[headers[index]] = value;
                      });
                      data.push(row);
                    }
                    callback(data, __path__);
                  });
                } catch (error) {
                  console.error("Error parsing CSV:", error);
                }
              });
            } else {
              entry.autodrain();
            }
          })
          .on("close", () => {
            console.log(`Zip file processed: ${filename}`);
          });
      }
    });
  }
}

module.exports = Watcher;
