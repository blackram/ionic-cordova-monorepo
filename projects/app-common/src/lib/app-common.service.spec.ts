import { TestBed } from '@angular/core/testing';

import { AppCommonService } from './app-common.service';

describe('AppCommonService', () => {
  let service: AppCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
