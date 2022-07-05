import { Injectable } from '@angular/core';
import { csv, max, min, median, mean, mode, json } from 'd3';
import {
  TemperatureCSVDataModel,
  TemperatureDataField,
  TemperatureDataMetadata,
  TemperatureDataModel,
  TemperatureGuess,
  TemperatureLegendItem,
  TemperatureListings,
} from '../models/temperature-data.model';

@Injectable({
  providedIn: 'root',
})
export class DataManagerService {
  SENSOR_COLOR = {
    [TemperatureDataField.EXTERNAL_SENSOR]: '#F87474',
    [TemperatureDataField.INTERNAL_SENSOR]: '#3AB0FF',
    [TemperatureDataField.LIGHT_SENSOR]: '#FFB562',
  };

  FIELD_COLOR = {
    [TemperatureDataField.DATE]: '#5a5a5a',
    ...this.SENSOR_COLOR,
  };

  SENSOR_LABEL = {
    [TemperatureDataField.EXTERNAL_SENSOR]: 'External °F',
    [TemperatureDataField.INTERNAL_SENSOR]: 'Car cabin °F',
    [TemperatureDataField.LIGHT_SENSOR]: 'Light %',
  };

  FIELD_LABEL = {
    [TemperatureDataField.DATE]: 'Time',
    ...this.SENSOR_LABEL,
  };

  TEMPERATURE_LISTINGS_URL =
    '//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/temperature-listings.json';
  TEMPERATURE_GUESSES_URL =
    '//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/temperature-guesses.json';

  constructor() {}

  /**
   * Retrieves and processes a temperature dataset
   * @param filename URL to CSV
   * @returns temperature dataset
   */
  async loadData(filename: string) {
    let results: TemperatureDataModel[] = [];
    try {
      const data: TemperatureCSVDataModel[] = (await csv(
        filename
      )) as TemperatureCSVDataModel[];

      // remap data into proper types and values
      results = data.map((curItem) => {
        return {
          [TemperatureDataField.DATE]: new Date(
            curItem[TemperatureDataField.DATE]
          ),
          [TemperatureDataField.LIGHT_SENSOR]:
            (Number(curItem[TemperatureDataField.LIGHT_SENSOR]) / 1000) * 100,
          [TemperatureDataField.INTERNAL_SENSOR]: Number(
            curItem[TemperatureDataField.INTERNAL_SENSOR]
          ),
          [TemperatureDataField.EXTERNAL_SENSOR]: Number(
            curItem[TemperatureDataField.EXTERNAL_SENSOR]
          ),
        };
      });
    } catch (error: any) {
      console.error('error: loadData', error.message);
      throw error;
    }

    return results;
  }

  /**
   * Retrieves the list of temperature listing
   * @returns TemperatureListing object
   */
  async loadListings() {
    const listings = (await json<TemperatureListings>(
      this.TEMPERATURE_LISTINGS_URL
    )) as TemperatureListings;

    return listings;
  }

  /**
   * Returns a list of name/guesses pairs
   * @returns list of temperature guesses
   */
  async loadGuesses() {
    const listings = await this.loadListings();
    const maxTemperature = Math.max(
      ...listings.maxTemperatures.map((item) => item.temperature)
    );
    const guesses = (await json<TemperatureGuess[]>(
      this.TEMPERATURE_GUESSES_URL
    )) as TemperatureGuess[];

    const weightedGuesses = guesses.map((item) => {
      item.weight = Math.abs(item.guess - maxTemperature);
      return item;
    });

    weightedGuesses.sort((a, b) => {
      const aWeight = a.weight || maxTemperature;
      const bWeight = b.weight || maxTemperature;
      return aWeight - bWeight;
    });

    // calculate rankings accounting for "ties"
    let prevWeight = -1;
    let curRank = 0;
    for (let item of weightedGuesses) {
      if ((item.weight as number) !== prevWeight) {
        curRank += 1;
      }
      prevWeight = item.weight as number;
      item.weight = curRank;
    }
    console.log('maxTemperature', weightedGuesses);
    return { maxTemperature, guesses: weightedGuesses };
  }

  /**
   * Computes min, max, mean, and median values for temperature dataset
   * @param data temperature dataset
   * @returns statistical metadata for dataset
   */
  analyzeDataset(data: TemperatureDataModel[]): TemperatureDataMetadata {
    const externalMax = max(
      data,
      (d) => d[TemperatureDataField.EXTERNAL_SENSOR]
    ) as number;

    const internalMin = min(
      data,
      (d) => d[TemperatureDataField.INTERNAL_SENSOR]
    ) as number;

    const internalMax = max(
      data,
      (d) => d[TemperatureDataField.INTERNAL_SENSOR]
    ) as number;

    const internalMed = median(
      data,
      (d) => d[TemperatureDataField.INTERNAL_SENSOR]
    ) as number;

    const internalMod = mode(data, (d) =>
      Math.round(d[TemperatureDataField.INTERNAL_SENSOR])
    ) as number;

    const internalMean =
      Math.round(
        (mean(data, (d) => d[TemperatureDataField.INTERNAL_SENSOR]) as number) *
          100
      ) / 100;
    const startTimestamp = data[0][TemperatureDataField.DATE];
    const endTimestamp = data[data.length - 1][TemperatureDataField.DATE];

    return {
      startTimestamp,
      endTimestamp,
      externalMax,
      internalMax,
      internalMin,
      internalMean,
      internalMed,
      internalMod,
    };
  }

  /**
   * Returns list of legend items
   * @returns list of label / color pairs
   */
  getLegendItems(): TemperatureLegendItem[] {
    const fields: (
      | TemperatureDataField.LIGHT_SENSOR
      | TemperatureDataField.EXTERNAL_SENSOR
      | TemperatureDataField.INTERNAL_SENSOR
    )[] = [
      TemperatureDataField.INTERNAL_SENSOR,
      TemperatureDataField.EXTERNAL_SENSOR,
      TemperatureDataField.LIGHT_SENSOR,
    ];

    return fields.map((field) => {
      return {
        label: this.SENSOR_LABEL[field],
        color: this.SENSOR_COLOR[field],
      };
    });
  }
}
