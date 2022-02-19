let fs = require("fs");
let array = fs.readFileSync("input.txt").toString().split("\n");

countSonarScansLargerThanPrevious(array);
countSumOfMeasurementsLargerThanPrevious(array);

function countSonarScansLargerThanPrevious(arrayScans) {
  let scansLargerThanPrevious = 0;

  for (let i = 1; i < arrayScans.length; i++) {
    if (parseInt(arrayScans[i]) > parseInt(arrayScans[i - 1])) scansLargerThanPrevious++;
  }
  console.log(`The number of scans larger than previous scan is:`);
  console.log(scansLargerThanPrevious);
}

function countSumOfMeasurementsLargerThanPrevious(arrayScans) {
  let sumPrevious = parseInt(arrayScans[0]) + parseInt(arrayScans[1]) + parseInt(arrayScans[2]);
  let sumCurrent = 0;
  let sumLargerThanPrevious = 0;

  for (let i = 1; i < arrayScans.length; i++) {
    sumCurrent = parseInt(arrayScans[i]) + parseInt(arrayScans[i + 1]) + parseInt(arrayScans[i + 2]);
    if (sumCurrent > sumPrevious) sumLargerThanPrevious++;
    sumPrevious = sumCurrent;
    if (i == arrayScans.length - 3) break;
  }

  console.log(`The number of the sum of the measurement windows (each 3), larger than the previous sum of measurement windows is:`);
  console.log(sumLargerThanPrevious);
}
