const csv = require('csvtojson')

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
            if (index !== 0) {
                let formatedObj = this.removeFieldsWithSingleQuotes(value)
                jsonData.push({
                    "accession_number": formatedObj.field1,
                    "measure": formatedObj.field9,
                    "result": formatedObj.field12
                })
            }
        })
        return jsonData;
    }
    process(callback) {
        csv({
            noheader: true,
            output: "json"
        })
        .fromString(this.data.toString())
        .then((csvRow) => {
            callback(this.jsonify(csvRow))
        })
    }
}

module.exports = Factory;
