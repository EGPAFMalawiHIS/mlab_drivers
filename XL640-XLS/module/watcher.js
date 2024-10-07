const fs = require("fs");
const path = require("path");
const chokidar = require('chokidar');

class Watcher {
    constructor(folder) {
        this.folder = folder;
    }

    watch(callback) {
        var watcher = chokidar.watch(this.folder, {ignored: /[\/\\]\./, persistent: true});
        console.log(`\x1b[33m✨️BS120 Node Driver Running - Watching dir ${this.folder} for .csv file changes\x1b[0m`);
        watcher.on('all', (_event, __path__) => {
            console.log(`\x1b[33m✨️File changed: ${__path__}\x1b[0m`);
            if(path.extname(__path__) === '.xls' && fs.existsSync(path.join(__path__))){
                fs.readFile(path.join(__path__), "utf8", (err, data) => {
                    if (err) {
                        console.error('An error occurred: ', err);
                        return;
                    }
                    callback(data, __path__);
                });
            }
        })
    }
}

module.exports = Watcher;
