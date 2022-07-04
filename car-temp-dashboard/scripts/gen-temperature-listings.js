const fs = require("fs-extra");
const path = require("path");
const { parse } = require("csv-parse");

const BASE_PATH = path.resolve("../data/challenge");
const TEMPERATURE_LISTINGS_PATH = path.resolve(
  BASE_PATH,
  "temperature-listings.json"
);
const BASE_URL = "//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures";
const temperatureListings = { datasets: [], maxTemperatures: [] };

const COL_INDEX = {
  DATE: 0,
  LIGHT: 1,
  SENSOR_1: 2,
  SENSOR_2: 3,
};

readCSV = (filename) =>
  new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filename)
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        const [date, sensorLight, sensor1, sensor2] = row;
        data.push([
          new Date(date),
          Number(sensorLight),
          Number(sensor1),
          Number(sensor2),
        ]);
      })
      .on("end", function () {
        console.log("finished");
        resolve(data);
      })
      .on("error", function (error) {
        console.log(error.message);
        reject(error);
      });
  });

extractDate = (fileStr) => {
  const year = Number(fileStr.substring(0, 4));
  const month = Number(fileStr.substring(4, 6));
  const day = Number(fileStr.substring(6, 8));

  return `${month}/${day}/${year}`;
};

init = async () => {
  const files = fs
    .readdirSync(BASE_PATH)
    .filter((file) => file.match(/^2022.*csv$/));

  for (const file of files) {
    const filename = path.resolve(BASE_PATH, file);
    console.log(`Parse ${filename} ...`);
    const csvData = await readCSV(filename);

    // populate temperature listings
    temperatureListings.maxTemperatures.push({
      date: extractDate(file),
      temperature: Math.max(...csvData.map((item) => item[COL_INDEX.SENSOR_1])),
    });
    temperatureListings.datasets.push({
      date: extractDate(file),
      url: `${BASE_URL}/${file}`,
    });
  }

  // sort datasets from greatest to least
  temperatureListings.datasets.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    return dateB - dateA;
  });

  fs.writeJSON(TEMPERATURE_LISTINGS_PATH, temperatureListings, { spaces: 2 });
  console.log(`Saved temperature listings: ${TEMPERATURE_LISTINGS_PATH}`);
};

init();
