const { csvToJson, jsonToCsvFunc } = require("./csv-parser");

//without Header
const wihtoutHeaderJson = csvToJson(
  "data/small-csv.csv",
  false,
  (delimiter = ",")
);

//with Header
const withHeaderJson = csvToJson(
  "data/small-csv.csv",
  true,
  (delimiter = ","),
  true
);

//JSON to CSV
const jsonFromCsv = jsonToCsvFunc("data/header-csv-output.txt", ",");
