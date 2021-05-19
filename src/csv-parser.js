const fs = require("fs");
const { delimiter } = require("path");
const path = require("path");
const { Transform } = require("stream");

const parseCsvToJson = (
  chunk,
  delimiter,
  withHeader,
  modifyHeader,
  headerArray,
  chunkCount
) => {
  const rows = chunk.split(/\r?\n/g).map((row) => row.split(delimiter));

  if (!withHeader) {
    return rows;
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
    return jsonRows;
  }
};

const getHeader = (chunk) => {
  const rows = chunk.split(/\r?\n/g).map((row) => row.split(delimiter));

  return rows[0];
};

const csvToJsonSync = (inputFilePath, delimiter, withHeader, modifyHeader) => {
  const readableStream = fs.createReadStream(path.resolve(inputFilePath));
  const transformStream = new Transform();

  let chunkCount = 1;
  let headerArray;

  readableStream.on("data", (chunk) => {
    if (withHeader && chunkCount === 1) {
      headerArray = getHeader(chunk.toString())[0].split(delimiter);
    }

    const result = parseCsvToJson(
      chunk.toString(),
      delimiter,
      withHeader,
      modifyHeader,
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
  return JSON.stringify(
    csvToJsonSync(inputFilePath, delimiter, withHeader, modifyHeader)
  );
};
