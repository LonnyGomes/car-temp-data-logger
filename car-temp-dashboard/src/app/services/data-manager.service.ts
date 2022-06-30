import { Injectable } from '@angular/core';
import { csv, max, min, median, mean, mode } from 'd3';
import {
  TemperatureCSVDataModel,
  TemperatureDataMetadata,
  TemperatureDataModel,
} from '../models/temperature-data.model';

@Injectable({
  providedIn: 'root',
})
export class DataManagerService {
  constructor() {}

  async loadData(filename: string) {
    let results: TemperatureDataModel[] = [];
    try {
      const data: TemperatureCSVDataModel[] = (await csv(
        filename
      )) as TemperatureCSVDataModel[];

      // remap data into proper types and values
      results = data.map((curItem) => {
        return {
          date: new Date(curItem.date),
          photocell: (Number(curItem.photocell) / 1000) * 100,
          sensor_1: Number(curItem.sensor_1),
          sensor_2: Number(curItem.sensor_2),
        };
      });
    } catch (error: any) {
      console.error('error: loadData', error.message);
      throw error;
    }

    return results;
  }

  /**
   * Computes min, max, mean, and median values for temperature dataset
   * @param data temperature dataset
   * @returns statistical metadata for dataset
   */
  analyzeDataset(data: TemperatureDataModel[]): TemperatureDataMetadata {
    const externalMax = max(data, (d) => d.sensor_2) as number;
    const internalMin = min(data, (d) => d.sensor_1) as number;
    const internalMax = max(data, (d) => d.sensor_1) as number;
    const internalMed = median(data, (d) => d.sensor_1) as number;
    const internalMod = mode(data, (d) => Math.round(d.sensor_1)) as number;
    const internalMean =
      Math.round((mean(data, (d) => d.sensor_1) as number) * 100) / 100;
    const startTimestamp = data[0].date;
    const endTimestamp = data[data.length - 1].date;

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
}
