class Factory {
    constructor(data) {
        this.data = data;
    }
    processData(rawData) {
        const lines = rawData.trim().split('\n');
        const results = [];
         // flag to track when to start processing
        let processing = false;
    
        lines.forEach(line => {
            line = line.trim();
            
            // Start processing only from the first line containing the data (e.g. line starting with "1")
            if (!processing && /^\d+\s/.test(line)) {
                processing = true;
            }
    
            if (processing) {
                 // Split by tab
                const parts = line.split(/\t+/);
                if (parts.length > 5) {
                    // Sample ID
                    const accession_number = parts[1];
                    // Test (Na, K, Cl, etc.)
                    const measure = parts[3];
                    // Result value
                    const result = parts[4];
                    results.push({
                        accession_number,
                        measure,
                        result
                    });
                }
            }
        });
    
        return results;
    }
    process(callback) {
        // console.log(this.data);
        let jsonData = this.processData(this.data)
        // console.log(jsonData);
        callback(jsonData)
    }
}

module.exports = Factory;
