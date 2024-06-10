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
            let groupedData = [];
            groupedData.push(this.jsonify(csvRow).reduce((acc, cur) => {
                const { accession_number, measure, result } = cur;
                if (!acc[accession_number]) {
                    acc[accession_number] = [];
                }
                acc[accession_number].push({ measure, result });
                return acc;
            }, {}))
            callback(groupedData)
        })
    }
}

module.exports = Factory;
