class Factory {
    constructor(data) {
        this.data = data;
    }

    removeFieldsWithSingleQuotes(obj) {
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] !== '') {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    }

    process(callback) {
        // Assuming data is array of records from CSV
        // Group by accession_number (Sample ID)
        const grouped = {};
        this.data.forEach(record => {
            const accession = record['Sample ID'] || record['Accession'] || record['ID'];
            const test = record['Test'] || record['Analyte'];
            const value = record['Result'] || record['Value'];
            const unit = record['Unit'] || '';

            if (!grouped[accession]) {
                grouped[accession] = { accession_number: accession, results: [] };
            }
            if (test && value) {
                grouped[accession].results.push({ test: test.trim(), value: value.trim(), unit: unit.trim() });
            }
        });

        // Return array of grouped data
        const result = Object.values(grouped);
        callback(result);
    }
}

module.exports = Factory;