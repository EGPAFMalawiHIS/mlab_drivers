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
      resultSegmentSectionResponse.push({
        sampleId: sampleId,
        hostTestCode: hostTestCode,
        resultTestCode: resultTestCode,
        resultValue: resultValue.replace(/\^/g, ""),
        units: resultSegmentSectionItems[4],
        valueModifier: resultSegmentSectionItems[6],
        minRange: resultSegmentSectionItems[5].split("to")[0],
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
    let resultvalue =
      `${result.resultValue} ${result.valueModifier} ${result.minRange}${result.units}`.trim();
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
