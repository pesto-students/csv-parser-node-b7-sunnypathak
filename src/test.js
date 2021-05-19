const { csvToJson } = require("./csv-parser");

const result = csvToJson("data/small-csv.csv", ",", true);

console.log(result);
