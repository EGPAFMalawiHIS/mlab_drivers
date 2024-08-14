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

  process(callback) {
    console.log(this.data)
    callback(this.data);
  }
}

module.exports = Factory;
