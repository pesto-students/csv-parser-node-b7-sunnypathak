const fs = require("fs");
const path = require("path");
const { Transform } = require("stream");

//without Header
const csvToJSON = (readableStream, delimiter = ",") => {
  const writeStream = new Transform();
  let lineNumber = 0;

  readableStream.on("data", (chunk) => {
    const rows = chunk.split(/\r?\n/g);
    writeStream.push("[ ");

    for (const row of rows) {
      let outPut = "";

      const columnItems = row.split(delimiter);
      outPut = JSON.stringify(columnItems);

      writeStream.push(outPut);
      if (lineNumber < rows.length - 1) {
        writeStream.push(",\n");
      }

      lineNumber += 1;
    }
  });

  readableStream.on("close", () => {
    writeStream.push(" ]");
  });

  return writeStream;
};

//With Header
const csvToJSONWithHeader = (
  readableStream,
  delimiter = ",",
  upperCaseHeader
) => {
  const writeStream = new Transform();
  let lineNumber = 0;

  readableStream.on("data", (chunk) => {
    const rows = chunk.split(/\r?\n/g);
    let headerArray;

    for (const row of rows) {
      let outputObj = {};
      if (lineNumber === 0) {
        headerArray = row.split(delimiter);
        headerArray = headerArray.map((columnHeader) =>
          columnHeader.toUpperCase()
        );
        writeStream.push("[ ");
      } else {
        const columns = row.split(delimiter);

        columns.map((columnItem, index) => {
          outputObj[headerArray[index]] = columnItem;
        });

        writeStream.push(JSON.stringify(outputObj));
        if (lineNumber < rows.length - 1) {
          writeStream.push(",\n");
        }
      }

      lineNumber += 1;
    }
  });

  readableStream.on("close", () => {
    writeStream.push(" ]");
  });

  return writeStream;
};

//convert JSON to csv
const jsonToCsv = (inputFilePath, delimiter) => {
  let headers;
  let csvRows;

  const writeStream = new Transform();
  fs.readFile(inputFilePath, "utf8", (err, fileData) => {
    if (err) console.log(err);
    const jsonData = JSON.parse(fileData);

    jsonData.map((data, index) => {
      if (index === 0) {
        headers = Object.keys(data).join(delimiter);
        writeStream.push(`${headers}\n`);
        csvRows = Object.values(data).join(delimiter);
        writeStream.push(`${csvRows}\n`);
      } else {
        csvRows = Object.values(data).join(delimiter);
        writeStream.push(`${csvRows}\n`);
      }
    });
  });

  return writeStream;
};

module.exports.csvToJson = (
  inputFilePath,
  withHeaders = false,
  delimiter = ",",
  outPutFilePath,
  upperCaseHeader = false
) => {
  const readableStream = fs.createReadStream(path.resolve(inputFilePath));
  readableStream.setEncoding("utf8");

  if (!withHeaders) {
    return csvToJSON(readableStream, delimiter);
  } else {
    return csvToJSONWithHeader(readableStream, delimiter, upperCaseHeader);
  }
};

module.exports.jsonToCsvFunc = (
  inputFilePath,
  delimiter = ",",
  outPutFilePath
) => {
  jsonToCsv(inputFilePath, delimiter);
};
