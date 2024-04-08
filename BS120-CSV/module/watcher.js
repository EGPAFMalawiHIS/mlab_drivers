const fs = require("fs");
const path = require("path");

class Watcher {
    constructor(folder) {
        this.folder = folder;
    }
    watch(callback) {
        console.log(`\x1b[33m✨️BS120 Node Driver Running - Watching dir ${this.folder} for .csv file changes\x1b[0m`);
        fs.watch(this.folder, (event, filename) => {
            if (event === "rename" && path.extname(filename) === '.csv') {
                console.log(`\x1b[33m✨️File changed: ${filename}\x1b[0m`);
                fs.readFile(path.join(this.folder, filename), "utf8", (err, data) => {
                    if (err) {
                        console.error('An error occurred: ', err);
                        return;
                    }
                    callback(data);
                });
            }
        });
    }
}

module.exports = Watcher;
