import { TestBed } from '@angular/core/testing';

import { DataManagerService } from './data-manager.service';

describe('DataManagerService', () => {
  let service: DataManagerService;
  const SAMPLE_CSV = './fixtures/sample.csv';
  const SAMPLE_CSV_DATA_LEN = 4;

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
});
