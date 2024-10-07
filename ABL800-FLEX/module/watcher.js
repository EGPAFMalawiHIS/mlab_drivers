const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const readline = require("readline");
const unzipper = require("unzipper");
const iconv = require('iconv-lite');
const chardet = require('chardet');

class Watcher {
  constructor(folder) {
    this.folder = folder;
  }
  watch(callback) {
    var watcher = chokidar.watch(this.folder, {
      ignored: false,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 5000,
        pollInterval: 100,
      },
    });

    console.log(
      `\x1b[33m✨️ABL 800 FLEX Driver Running - Watching dir ${this.folder} for .txt file changes\x1b[0m`
    );
    watcher.on("add", (__path__) => {
      const filename = path.basename(__path__);
      let fData = {
        accession_number: null,
        results: [],
      };
      if (filename == "PatInfo.txt") {
        fs.readFile(path.join(this.folder, 'PatInfo.txt'), "utf8", (err, data) => {
          if (err) {
            console.error(`Error reading file ${filename}:`, err);
            return;
          }
          const lines = data.split("\n");
          const jsonResult = {};

          lines.forEach((line) => {
            const parts = line.split(";");
            if (parts.length > 2) {
              const key = parts[1].replace(/"/g, "").trim();
              const value = parts[2].replace(/"/g, "").trim();
              if (key && value) {
                jsonResult[key] = value;
              }
            }
          });
          const patientIdMatch = data.match(/"Patient ID";"(\d+)\s*"/);
          if (patientIdMatch) {
            fData.accession_number = patientIdMatch[1];
            setTimeout(() => {
              fs.readFile(path.join(this.folder, "PatRes.txt"), "utf-8", (err, data) => {
                if (err) {
                  console.error(`Error reading file ${filename}:`, err);
                  return;
                }

                const lines = data.split("\n");
                const results = [];

                lines.forEach((line) => {
                  const parts = line.split(";");
                  if (parts.length > 2) {
                    const test = iconv.decode(Buffer.from(parts[2]), 'utf-8')
                    .replace(/"/g, "")
                    .replace(/�/g, "?")
                    .trim();
                    const value = parts[3].replace(/"/g, "").trim();
                    const unit = parts[5].replace(/"/g, "").trim();

                    if (test) {
                      const entry = {
                        test,
                        value,
                        unit,
                        // range: parts
                        //   .slice(7, 11)
                        //   .map((part) => part.replace(/"/g, "").trim()),
                      };
                      results.push(entry);
                    }
                  }
                });
                fData.results = results;
                callback(fData, __path__);
              });
            }, 3000);
          } else {
            console.error("Patient ID not found.");
          }
        });
      }
    });
  }
}

module.exports = Watcher;
