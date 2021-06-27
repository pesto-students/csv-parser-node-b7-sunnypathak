const fs = require("fs");
const path = require("path");
const { Transform } = require("stream");

const getHeader = (chunk, delimiter) => {
  return chunk.split(/\r?\n/g).map((row) => row.split(delimiter))[0];
};

const parseCsvToJson = (
  chunk,
  delimiter,
  withHeader,
  headerArray,
  chunkCount
) => {
  const rows = chunk.split(/\r?\n/g).map((row) => row.split(delimiter));

  if (!withHeader) {
    return JSON.stringify(rows);
  } else {
    let jsonRows = [];

    if (chunkCount === 1) rows.shift();

    for (const row of rows) {
      let jsonRowObj = {};
      row.map((data, columnIndex) => {
        jsonRowObj[headerArray[columnIndex]] = data;
      });
      jsonRows.push(jsonRowObj);
    }
    return JSON.stringify(jsonRows, null, "\t");
  }
};

const csvToJsonSync = (inputFilePath, delimiter, withHeader, modifyHeader) => {
  const readableStream = fs.createReadStream(path.resolve(inputFilePath));
  const transformStream = new Transform();

  let chunkCount = 1;
  let headerArray;

  readableStream.on("data", (chunk) => {
    if (withHeader && chunkCount === 1) {
      headerArray = getHeader(chunk.toString(), delimiter);
      if (modifyHeader) {
        headerArray = headerArray.map((headerStr) => headerStr.toUpperCase());
      }
    }

    const result = parseCsvToJson(
      chunk.toString(),
      delimiter,
      withHeader,
      headerArray,
      chunkCount
    );

    transformStream.push(result.toString());

    chunkCount += 1;
  });

  return transformStream;
};

module.exports.csvToJson = (
  inputFilePath,
  delimiter = ",",
  withHeader = false,
  modifyHeader = false
) => {
  return csvToJsonSync(inputFilePath, delimiter, withHeader, modifyHeader);
};
