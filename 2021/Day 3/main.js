let fs = require("fs");
let array = fs.readFileSync("input.txt").toString().split("\n");

findGammaAndEpsilonRate(array);
findLifeSupportRating(array);

function findGammaAndEpsilonRate(arrayOfBits) {
  let ones = 0;
  let zeros = 0;
  let gammaRateBitArray = [];
  let epsilonRateBitArray = [];
  let decimalGammaRate;
  let decimalEpsilonRate;
  let rezult;

  let numberOfBitsPerLine = arrayOfBits[0].split("");
  numberOfBitsPerLine.splice(numberOfBitsPerLine.length - 1, 1);
  numberOfBitsPerLine = numberOfBitsPerLine.length;

  for (let i = 0; i < numberOfBitsPerLine; i++) {
    for (let j = 0; j < arrayOfBits.length; j++) {
      // Makes an array of each individual bit of the line where the whitespace/empty space at the end of the line is removed
      // from being in the new array.
      let individualBitsArray = arrayOfBits[j].split("");
      individualBitsArray.splice(individualBitsArray.length - 1, 1);

      if (parseInt(individualBitsArray[i]) === 1) ones++;
      if (parseInt(individualBitsArray[i]) === 0) zeros++;
    }

    if (ones > zeros) {
      gammaRateBitArray.push("1");
      epsilonRateBitArray.push("0");
    }
    if (zeros > ones) {
      gammaRateBitArray.push("0");
      epsilonRateBitArray.push("1");
    }

    ones = 0;
    zeros = 0;
  }

  decimalGammaRate = parseInt(gammaRateBitArray.join(""), 2);
  decimalEpsilonRate = parseInt(epsilonRateBitArray.join(""), 2);
  rezult = decimalGammaRate * decimalEpsilonRate;

  console.log("Gamma and epsilon rate multiplied together is:");
  console.log(rezult);
}

function findLifeSupportRating(arrayOfBits) {
  let oxygenBits = Oxygen(arrayOfBits);
  let CO2Bits = CO2(arrayOfBits);

  let numberOfBitsPerLineOxygen = oxygenBits.split("");
  numberOfBitsPerLineOxygen.splice(numberOfBitsPerLineOxygen.length - 1, 1);
  let decimalOxygen = parseInt(numberOfBitsPerLineOxygen.join(""), 2);

  let numberOfBitsPerLineCO2 = CO2Bits.split("");
  numberOfBitsPerLineCO2.splice(numberOfBitsPerLineCO2.length - 1, 1);
  let decimalCO2 = parseInt(numberOfBitsPerLineCO2.join(""), 2);

  let rezult = decimalOxygen * decimalCO2;
  console.log("Life support rating is:");
  console.log(rezult);
}

function Oxygen(arrayOfBits) {
  let ones = 0;
  let zeros = 0;
  let tempArray = [...arrayOfBits];
  let rezult = "";
  let numberOfBitsPerLine = arrayOfBits[0].split("");
  numberOfBitsPerLine.splice(numberOfBitsPerLine.length - 1, 1);
  numberOfBitsPerLine = numberOfBitsPerLine.length;

  for (let i = 0; i < numberOfBitsPerLine; i++) {
    if (tempArray.length === 1) break;
    // Count how many ones and zeros at a position in the line of bits
    for (let j = 0; j < tempArray.length; j++) {
      // Makes an array of each individual bit of the line where the whitespace/empty space at the end of the line is removed
      // from being in the new array.
      let individualBitsArray = tempArray[j].split("");
      individualBitsArray.splice(individualBitsArray.length - 1, 1);

      if (parseInt(individualBitsArray[i]) === 1) ones++;
      if (parseInt(individualBitsArray[i]) === 0) zeros++;
    }

    // Removing lines from the tempArray based on the criteria
    for (let j = 0; j < tempArray.length; j++) {
      let individualBitsArray = tempArray[j].split("");
      individualBitsArray.splice(individualBitsArray.length - 1, 1);

      if (ones > zeros || ones === zeros) {
        if (parseInt(individualBitsArray[i]) === 0) {
          tempArray.splice(j, 1);
          j--;
        }
      } else {
        if (parseInt(individualBitsArray[i]) === 1) {
          tempArray.splice(j, 1);
          j--;
        }
      }
    }

    ones = 0;
    zeros = 0;
  }

  rezult = tempArray[0];
  return rezult;
}

function CO2(arrayOfBits) {
  let ones = 0;
  let zeros = 0;
  let tempArray = [...arrayOfBits];
  let rezult = "";
  let numberOfBitsPerLine = arrayOfBits[0].split("");
  numberOfBitsPerLine.splice(numberOfBitsPerLine.length - 1, 1);
  numberOfBitsPerLine = numberOfBitsPerLine.length;

  for (let i = 0; i < numberOfBitsPerLine; i++) {
    if (tempArray.length === 1) break;
    // Count how many ones and zeros at a position in the line of bits
    for (let j = 0; j < tempArray.length; j++) {
      // Makes an array of each individual bit of the line where the whitespace/empty space at the end of the line is removed
      // from being in the new array.
      let individualBitsArray = tempArray[j].split("");
      individualBitsArray.splice(individualBitsArray.length - 1, 1);

      if (parseInt(individualBitsArray[i]) === 1) ones++;
      if (parseInt(individualBitsArray[i]) === 0) zeros++;
    }

    // Removing lines from the tempArray based on the criteria
    for (let j = 0; j < tempArray.length; j++) {
      let individualBitsArray = tempArray[j].split("");
      individualBitsArray.splice(individualBitsArray.length - 1, 1);

      if (ones < zeros) {
        if (parseInt(individualBitsArray[i]) === 0) {
          tempArray.splice(j, 1);
          j--;
        }
      } else {
        if (parseInt(individualBitsArray[i]) === 1) {
          tempArray.splice(j, 1);
          j--;
        }
      }
    }

    ones = 0;
    zeros = 0;
  }

  rezult = tempArray[0];
  return rezult;
}
