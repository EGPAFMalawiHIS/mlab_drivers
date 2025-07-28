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
                // First try splitting by tabs
                let parts = line.split('\t');
                
                // If no tabs found, split by multiple whitespace
                if (parts.length === 1) {
                    parts = line.split(/\s+/);
                }
                // Filter out empty strings
                parts = parts.filter(part => part.trim() !== '');
                // console.log(parts)
                if (parts.length >= 7) {
                    const srNumber = parts[0];
                    const sampleId = parts[1];
                    
                    // Handle patient name - it might be empty or multiple words
                    let patientName = '';
                    let testIndex = 2;
                    
                    // Check if parts[2] looks like a test name (usually 2-5 uppercase letters/numbers)
                    // Common test patterns: SGOT, Na, K, Cl, PHO, UREA, CRE, CA, MGXB, LDH, etc.
                    const isTestPattern = /^[A-Za-z]{1,5}[0-9]*$/.test(parts[2]);
                    
                    if (isTestPattern) {
                        // parts[2] is likely the test, so patient name is empty
                        patientName = '';
                        testIndex = 2;
                    } else {
                        // parts[2] is patient name, find where test starts
                        // Look for the test pattern in subsequent parts
                        let foundTest = false;
                        for (let i = 2; i < parts.length - 5; i++) {
                            if (/^[A-Z]{1,6}[0-9]*$/.test(parts[i])) {
                                patientName = parts.slice(2, i).join(' ').trim();
                                testIndex = i;
                                foundTest = true;
                                break;
                            }
                        }
                        
                        if (!foundTest) {
                            // Fallback: assume patient name is parts[2]
                            patientName = parts[2];
                            testIndex = 3;
                        }
                    }
                    // Make sure we have enough parts remaining
                    if (parts.length >= testIndex + 5) {
                        const test = parts[testIndex];
                        const result = parts[testIndex + 1];
                        const unit = parts[testIndex + 2];
                        const flag = parts[testIndex + 3] || '';
                        const resultDate = parts[testIndex + 4] + ' ' + parts[testIndex + 5];
                        
                        results.push({
                            sr_number: srNumber,
                            accession_number: sampleId,
                            patient_name: patientName,
                            measure: test,
                            result: result,
                            unit: unit,
                            flag: flag,
                            result_date: resultDate,
                        });
                    }
                }
            }
        });
        console.log(results.length + " records processed");
        return results;
    }
    
    process(callback) {
        let jsonData = this.processData(this.data);
        callback(jsonData);
    }
}

module.exports = Factory;