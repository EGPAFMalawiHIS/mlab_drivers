const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const parse = require("csv-parse");
const iconv = require("iconv-lite");

class Watcher {
    constructor(folder) {
        this.folder = folder;
    }

    watch(callback) {
        const watcher = chokidar.watch(this.folder, { ignored: /[\/\\]\./, persistent: true });
        console.log(`\x1b[33m✨️BS120 Driver Running - Watching dir ${this.folder} for exported .csv file changes\x1b[0m`);
        watcher.on("add", (filePath) => {
            console.log(`\x1b[33m✨️File changed: ${filePath}\x1b[0m`);
            setTimeout(() => {if (path.extname(filePath) === ".csv") {
                fs.readFile(filePath, null, (err, data) => {
                    if (err) {
                        console.error("An error occurred: ", err);
                        return;
                    }
                    try {
                        const utf8Data = iconv.decode(data, "utf16");
                        parse(utf8Data, { 
                            columns: true, 
                            skip_empty_lines: true, 
                            delimiter: "\t" 
                        }, (parseError, records) => {
                            if (parseError) {
                                console.error("Error parsing CSV:", parseError);
                                return;
                            }
                            callback(records, filePath);
                        });
                    } catch (error) {
                        console.error("Error processing file:", error);
                    }
                });
            }},10000);
        });
    }
}

module.exports = Watcher;
