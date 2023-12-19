const Sync = require("../service/sync");

class Handler extends Sync {
    static getInstance() {
        if (!Handler.instance) {
            Handler.instance = new Handler();
        }
        return Handler.instance;
    }

    process(data) {
        console.log(data)
        this.transmit(data)
    }
}

module.exports = Handler;
