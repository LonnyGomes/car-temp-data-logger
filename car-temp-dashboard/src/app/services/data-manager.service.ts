import { Injectable } from '@angular/core';
import { csv, DSVRowArray } from 'd3';
import {
  TemperatureCSVDataModel,
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
}
