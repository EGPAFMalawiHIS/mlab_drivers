function isValidPrefix(segment) {
  return (
    segment.startsWith("O") ||
    segment.startsWith("R") ||
    segment.startsWith("1H") ||
    segment.startsWith("P")
  );
}

function hasMoreThanTenElements(segementItems) {
  return segementItems.length > 10;
}

function containsFOrP(segementItems) {
  return segementItems.includes("F") || segementItems.includes("P");
}

function getTargetSegment(segment) {
  let segementItems = segment.split("|");
  const hasValidPrefix = isValidPrefix(segment);
  const hasEnoughElements = hasMoreThanTenElements(segementItems);
  const containsFP = containsFOrP(segementItems);
  return hasValidPrefix && hasEnoughElements && containsFP;
}

function getSampleId(targetSegments) {
  let targetSegment = targetSegments.filter((targetSegment) =>
    targetSegment.startsWith("O")
  );
  if (targetSegment.length == 0) {
    return null;
  } else {
    return extractSampleId(targetSegment[0]);
  }
}

function extractSampleId(sampleIdSegment) {
  let sampleIdSegmentSections = sampleIdSegment.split("|");
  let sampleId = sampleIdSegmentSections[2];
  sampleId = sampleId === "" ? null : sampleId;
  return sampleId;
}

function extractMachineName(targetSegments) {
  let targetSegment = targetSegments.filter((targetSegment) =>
    targetSegment.startsWith("1H")
  );
  if (targetSegment.length == 0) {
    return "";
  } else {
    machine = targetSegment[0].split("|")[4];
    machineItems = machine.split("^");
    machineName = machineItems[0].toLowerCase().includes("genexpert")
      ? machineItems[0]
      : `${machineItems[1]}-${machineItems[0]}`;
    machineName = machineName.includes("undefined") ? "" : machineName;
    return machineName;
  }
}

function getResults(targetSegments) {
  let sampleId = getSampleId(targetSegments);
  let machineName = extractMachineName(targetSegments);
  let resultSegmentSections = targetSegments.filter((targetSegment) =>
    targetSegment.startsWith("R")
  );
  if (resultSegmentSections.length == 0) {
    return [];
  } else {
    return processResults(resultSegmentSections, sampleId, machineName);
  }
}

function processResults(resultSegmentSections, sampleId, machineName) {
  let resultSegmentSectionResponse = [];
  resultSegmentSections.forEach((resultSegmentSection) => {
    const resultSegmentSectionItems = resultSegmentSection.split("|");
    let assayDetails = resultSegmentSectionItems[2].split("^");
    let hostTestCode = assayDetails[1];
    let resultTestCode = assayDetails[3];
    // Remove numbers from the result test code
    resultTestCode = resultTestCode.replace(/[0-9]/g, "");
    let resultValue = resultSegmentSectionItems[3];
    if (
      !(resultValue === "^") &&
      !(resultValue === "") &&
      !(sampleId === null) &&
      // Skip results containing "LOG"
      !resultSegmentSection.includes("LOG")
    ) {
      // Process the value modifier - only keep ">" and "<" characters
      let modifier = resultSegmentSectionItems[6];
      let processedModifier = (modifier === ">" || modifier === "<") ? modifier : "";

      // Clean up result value by removing carets
      let cleanResultValue = resultValue.replace(/\^/g, "");

      // Special handling for NOT DETECTED and ERROR results
      let minRange = "";
      let units = resultSegmentSectionItems[4];

      if (cleanResultValue.toUpperCase() === "NOT DETECTED") {
        // Don't include minRange or units for NOT DETECTED results
        minRange = "";
        units = "";
      } else if (cleanResultValue === "ERROR") {
        // Don't include minRange or units for ERROR results
        minRange = "";
        units = "";
      } else {
        // Normal case - include minRange for normal results
        minRange = resultSegmentSectionItems[5].split("to")[0];
      }

      resultSegmentSectionResponse.push({
        sampleId: sampleId,
        hostTestCode: hostTestCode,
        resultTestCode: resultTestCode,
        resultValue: cleanResultValue,
        units: units,
        valueModifier: processedModifier,
        minRange: minRange,
        machineName: machineName,
      });
    }
  });
  return resultSegmentSectionResponse;
}

function getResultUrls(results, mapping, settingsMachineName, buildUrl) {
  let urls = [];
  results.forEach((result) => {
    if (settingsMachineName == "") {
      settingsMachineName = result.machineName;
    }
    let measureId = mapping[result.resultTestCode];
    let sampleId = result.sampleId;
    if (
      result.hostTestCode.toLowerCase() == "mtb-xdr" &&
      result.resultTestCode == "MTB"
    ) {
      measureId = mapping["MTB XDR"];
    }
    let resultvalue = "";
    if (result.resultValue === "ERROR") {
      resultvalue = "ERROR";
    } else if (result.resultValue.toUpperCase() === "NOT DETECTED") {
      resultvalue = "NOT DETECTED";
    } else {
      resultvalue = `${result.resultValue} ${result.valueModifier} ${result.minRange} ${result.units}`.trim();
    }
    let url = buildUrl(sampleId, measureId, resultvalue, settingsMachineName);

    urls.push(url);
  });
  return [...new Set(urls)];
}

module.exports = {
  getTargetSegment,
  getResults,
  getResultUrls,
};
