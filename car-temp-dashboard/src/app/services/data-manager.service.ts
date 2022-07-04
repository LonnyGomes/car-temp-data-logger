import { Injectable } from '@angular/core';
import { csv, max, min, median, mean, mode } from 'd3';
import {
  TemperatureCSVDataModel,
  TemperatureDataField,
  TemperatureDataMetadata,
  TemperatureDataModel,
  TemperatureLegendItem,
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

  SENSOR_LABEL = {
    [TemperatureDataField.EXTERNAL_SENSOR]: 'External °F',
    [TemperatureDataField.INTERNAL_SENSOR]: 'Car cabin °F',
    [TemperatureDataField.LIGHT_SENSOR]: 'Light sensitivity %',
  };

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

  loadDatasets() {
    return {
      datasets: [
        {
          date: '6/30/2022',
          url: '//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/20220630.csv',
        },
        {
          date: '6/29/2022',
          url: '//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/20220629.csv',
        },
        {
          date: '6/28/2022',
          url: '//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/20220628.csv',
        },
        {
          date: '6/27/2022',
          url: '//s3.amazonaws.com/www.lonnygomes.com/data/car-temperatures/20220627.csv',
        },
      ],
    };
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
