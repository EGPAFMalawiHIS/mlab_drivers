class Factory {
  constructor(data) {
    this.data = data;
  }
  removeFieldsWithSingleQuotes(obj) {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !obj[key] == "") {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }

  jsonify(data) {
    const result = data.reduce(function (acc, value) {
      const accession_number = value["Patient Id"];
      const measurements = {
        pH: value['"pH"'],
        pCO2: value['"pCO2" (mmHg)'],
        p02: value['"pCO2" (mmHg)'],
        sO2e: value['"sO2" (%)'],
        fO2Hb: value['"O2Hb" (%)'],
        fHHbe: value['"RHb" (%)'],
        "cK+": value['"K+" (mmol/L)'],
        "cNa+": value['"Na+" (mmol/L)'],
        "cCa2+": value['"Ca++" (mmol/L)'],
        "cCI-": value['"Cl-" (mmol/L)'],
        cGIu: value['"Glu" (mmol/L)'],
        cLac: value['"Lac" (mmol/L)'],
      };

      const measurementObjects = Object.keys(measurements).map(function (
        measure
      ) {
        return {
          accession_number: accession_number,
          measure: measure,
          result: measurements[measure],
        };
      });

      return acc.concat(measurementObjects);
    }, []);

    return result;
  }

  process(callback) {
    callback(this.jsonify(this.data));
  }
}

module.exports = Factory;
