import { TestBed } from '@angular/core/testing';
import { sampleTemperatureData } from 'src/fixtures/sample-data';
import { TemperatureDataField } from '../models/temperature-data.model';

import { DataManagerService } from './data-manager.service';

describe('DataManagerService', () => {
  let service: DataManagerService;
  const SAMPLE_CSV = './fixtures/sample.csv';
  const SAMPLE_CSV_DATA_LEN = 4;
  const SAMPLE_DATA_START_TIMESTAMP = new Date(
    'Wed Jun 29 2022 08:29:45 GMT-0400 (EDT)'
  );
  const SAMPLE_DATA_END_TIMESTAMP = new Date(
    'Wed Jun 29 2022 10:09:57 GMT-0400 (EDT)'
  );
  const SAMPLE_DATA_EXTERNAL_MAX = 93.99;
  const SAMPLE_DATA_INTERNAL_MIN = 72.27;
  const SAMPLE_DATA_INTERNAL_MAX = 108.39;
  const SAMPLE_DATA_INTERNAL_AVG = 94.44;
  const SAMPLE_DATA_INTERNAL_MED = 95.79;
  const SAMPLE_DATA_INTERNAL_MOD = 105;
  const SAMPLE_DATA_DATASET_RESULTS = {
    startTimestamp: SAMPLE_DATA_START_TIMESTAMP,
    endTimestamp: SAMPLE_DATA_END_TIMESTAMP,
    externalMax: SAMPLE_DATA_EXTERNAL_MAX,
    internalMax: SAMPLE_DATA_INTERNAL_MAX,
    internalMin: SAMPLE_DATA_INTERNAL_MIN,
    internalMean: SAMPLE_DATA_INTERNAL_AVG,
    internalMed: SAMPLE_DATA_INTERNAL_MED,
    internalMod: SAMPLE_DATA_INTERNAL_MOD,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadFile', () => {
    it('should be defined', () => {
      expect(service.loadData).toBeTruthy();
    });

    it('should load CSV', async () => {
      const data = await service.loadData(SAMPLE_CSV);
      expect(data).toBeTruthy();
      expect(data.length).toEqual(SAMPLE_CSV_DATA_LEN);
    });
  });

  describe('analyzeDataset', () => {
    it('should be defined', () => {
      expect(service.analyzeDataset).toBeTruthy();
    });

    it('should return statistical data for a dataset', () => {
      const results = service.analyzeDataset(sampleTemperatureData);
      expect(results).toEqual(SAMPLE_DATA_DATASET_RESULTS);
    });
  });

  describe('SENSOR_COLOR', () => {
    it('should define colors for each sensor', () => {
      expect(
        service.SENSOR_COLOR[TemperatureDataField.EXTERNAL_SENSOR]
      ).toBeDefined();
      expect(
        service.SENSOR_COLOR[TemperatureDataField.INTERNAL_SENSOR]
      ).toBeDefined();
      expect(
        service.SENSOR_COLOR[TemperatureDataField.LIGHT_SENSOR]
      ).toBeDefined();
    });
  });

  describe('SENSOR_LABEL', () => {
    it('should define legend labels for each sensor', () => {
      expect(
        service.SENSOR_LABEL[TemperatureDataField.EXTERNAL_SENSOR]
      ).toBeDefined();
      expect(
        service.SENSOR_LABEL[TemperatureDataField.INTERNAL_SENSOR]
      ).toBeDefined();
      expect(
        service.SENSOR_LABEL[TemperatureDataField.LIGHT_SENSOR]
      ).toBeDefined();
    });
  });
});
