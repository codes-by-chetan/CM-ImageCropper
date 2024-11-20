import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmImageCropperComponent } from './cm-image-cropper.component';

describe('CmImageCropperComponent', () => {
  let component: CmImageCropperComponent;
  let fixture: ComponentFixture<CmImageCropperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmImageCropperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmImageCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
