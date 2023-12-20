const Sync = require("../service/sync");
const fs = require("fs")

class Handler extends Sync {
    static getInstance() {
        if (!Handler.instance) {
            Handler.instance = new Handler();
        }
        return Handler.instance;
    }

    async process(data) {
        console.log(data)
        fs.writeFileSync('data.txt', data, (err) => {
            if (err) {
                console.error("could not save data to the file: ", err);
                return;
            }
            console.log('data saved to file');
        });
    }
}

module.exports = Handler;
