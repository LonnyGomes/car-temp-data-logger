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
