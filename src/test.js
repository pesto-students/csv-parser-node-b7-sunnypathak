const { csvToJson } = require("./csv-parser");

//without header
//csvToJson("data/small-csv.csv", ",", false, true).pipe(process.stdout);

//with header
csvToJson("data/big-csv.csv", ",", true, true).pipe(process.stdout);
