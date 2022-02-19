let fs = require("fs");
let array = fs.readFileSync("input.txt").toString().split("\n");

calculatePositions(array);
complicatedCalculatePositions(array);

function calculatePositions(arrayOfCommands) {
  let horizontalPosition = 0;
  let depth = 0;

  for (let i = 0; i < arrayOfCommands.length; i++) {
    let command = arrayOfCommands[i].split(" ");
    if (command[0] === "forward") horizontalPosition += parseInt(command[1]);
    if (command[0] === "down") depth += parseInt(command[1]);
    if (command[0] === "up") depth -= parseInt(command[1]);
  }

  let rezult = horizontalPosition * depth;

  console.log(`The rezult of multiplying the final depth with the final horizontal position is:`);
  console.log(rezult);
}

function complicatedCalculatePositions(arrayOfCommands) {
  let horizontalPosition = 0;
  let depth = 0;
  let aim = 0;

  for (let i = 0; i < arrayOfCommands.length; i++) {
    let command = arrayOfCommands[i].split(" ");
    if (command[0] === "forward") {
      horizontalPosition += parseInt(command[1]);
      depth += aim * parseInt(command[1]);
    }
    if (command[0] === "down") aim += parseInt(command[1]);
    if (command[0] === "up") aim -= parseInt(command[1]);
  }

  let rezult = horizontalPosition * depth;

  console.log(`The rezult of multiplying the final depth with the final horizontal position in the more complex commands scenario is:`);
  console.log(rezult);
}
