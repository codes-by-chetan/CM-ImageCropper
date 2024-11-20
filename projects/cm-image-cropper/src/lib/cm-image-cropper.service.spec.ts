import { TestBed } from '@angular/core/testing';

import { CmImageCropperService } from './cm-image-cropper.service';

describe('CmImageCropperService', () => {
  let service: CmImageCropperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmImageCropperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
