export type SensorName = 'sensor_1' | 'sensor_2';
export const SENSOR_NAMES: SensorName[] = ['sensor_1', 'sensor_2'];

export enum TemperatureDataField {
  DATE = 'date',
  LIGHT_SENSOR = 'photocell',
  INTERNAL_SENSOR = 'sensor_1',
  EXTERNAL_SENSOR = 'sensor_2',
}

export interface TemperatureCSVDataModel {
  date: string;
  photocell: string;
  sensor_1: string;
  sensor_2: string;
}

export interface TemperatureDataModel {
  date: Date;
  photocell: number;
  sensor_1: number;
  sensor_2: number;
}

export interface TemperatureDataMetadata {
  startTimestamp: Date;
  endTimestamp: Date;
  externalMax: number;
  internalMax: number;
  internalMin: number;
  internalMean: number;
  internalMed: number;
  internalMod: number;
}
