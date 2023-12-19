class Handler {
    static getInstance() {
        if (!Handler.instance) {
            Handler.instance = new Handler();
        }
        return Handler.instance;
    }

    process(data) {
        console.log(data)
    }
}

module.exports = Handler;
