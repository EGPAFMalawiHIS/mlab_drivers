const fs = require("fs");
const path = require("path");
const chokidar = require('chokidar');
const csv = require('csv-parse/sync');
const iconv = require('iconv-lite');

class Watcher {
    constructor(folder) {
        this.folder = folder;
    }

    watch(callback) {
        var watcher = chokidar.watch(this.folder, {ignored: /[\/\\]\./, persistent: true});
        console.log(`\x1b[33m✨️BS120 Node Driver Running - Watching dir ${this.folder} for .csv file changes\x1b[0m`);
        watcher.on('all', (_event, __path__) => {
            console.log(`\x1b[33m✨️File changed: ${__path__}\x1b[0m`);
            if(path.extname(__path__) === '.csv'){
                fs.readFile(path.join(__path__), "utf8", (err, data) => {
                    if (err) {
                        console.error('An error occurred: ', err);
                        return;
                    }
                    try {
                        const utf8Data = iconv.decode(data, 'utf16');
                        const records = csv.parse(utf8Data, {
                            columns: true,
                            skip_empty_lines: true,
                            delimiter: '\t'
                        });
                        callback(records, __path__);
                    } catch (error) {
                        console.error('Error parsing CSV:', error);
                    }
                });
            }
        })
    }
}

module.exports = Watcher;
