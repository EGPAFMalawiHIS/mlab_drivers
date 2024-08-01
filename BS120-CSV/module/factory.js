class Factory {
    constructor(data) {
        this.data = data;
    }
    removeFieldsWithSingleQuotes(obj) {
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !obj[key] == '') {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    }

    jsonify(data) {
        let jsonData = [];
        data.forEach((value, index) => {
            jsonData.push({
                "accession_number": value["﷽Sample"],
                "measure": value["Test"],
                "result": value["Concentration"]
            })
        })
        return jsonData;
    }
    
    process(callback) {
        callback(this.jsonify(this.data));
    }
}

module.exports = Factory;