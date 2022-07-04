export enum TemperatureDataField {
  DATE = 'date',
  LIGHT_SENSOR = 'photocell',
  INTERNAL_SENSOR = 'sensor_1',
  EXTERNAL_SENSOR = 'sensor_2',
}

export type SensorName =
  | TemperatureDataField.INTERNAL_SENSOR
  | TemperatureDataField.EXTERNAL_SENSOR
  | TemperatureDataField.LIGHT_SENSOR;

export type FieldName =
  | TemperatureDataField.DATE
  | TemperatureDataField.INTERNAL_SENSOR
  | TemperatureDataField.EXTERNAL_SENSOR
  | TemperatureDataField.LIGHT_SENSOR;

export const SENSOR_NAMES: SensorName[] = [
  TemperatureDataField.INTERNAL_SENSOR,
  TemperatureDataField.EXTERNAL_SENSOR,
  TemperatureDataField.LIGHT_SENSOR,
];

export const FIELD_NAMES: FieldName[] = [
  TemperatureDataField.DATE,
  ...SENSOR_NAMES,
];

export interface TemperatureLegendItem {
  label: string;
  color: string;
}

export interface TemperatureCSVDataModel {
  [TemperatureDataField.DATE]: string;
  [TemperatureDataField.LIGHT_SENSOR]: string;
  [TemperatureDataField.INTERNAL_SENSOR]: string;
  [TemperatureDataField.EXTERNAL_SENSOR]: string;
}

export interface TemperatureDataModel {
  [TemperatureDataField.DATE]: Date;
  [TemperatureDataField.LIGHT_SENSOR]: number;
  [TemperatureDataField.INTERNAL_SENSOR]: number;
  [TemperatureDataField.EXTERNAL_SENSOR]: number;
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

export interface TemperatureDataset {
  date: string;
  url: string;
}
export interface MaxTemperatureDataset {
  date: string;
  temperature: number;
}

export interface TemperatureListings {
  datasets: TemperatureDataset[];
  maxTemperatures: MaxTemperatureDataset[];
}
