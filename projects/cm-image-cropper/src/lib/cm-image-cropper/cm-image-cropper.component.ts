import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CropperConfig {
  showCrop?: boolean;
  showRotate?: boolean;
  showFlip?: boolean;
  showZoom?: boolean;
  showBrightness?: boolean;
  showContrast?: boolean;
  showSaturation?: boolean;
}

interface AspectRatioOption {
  label: string;
  value: number;
}

@Component({
  selector: 'lib-cm-image-cropper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="image-cropper-container">
      <div class="image-cropper-card">
        <div class="image-cropper-body">
          <ng-container *ngIf="!imageUrl; else cropperTemplate">
            <div class="upload-container">
              <label for="image-upload" class="upload-label">Upload Image</label>
              <input id="image-upload" type="file" (change)="onFileSelected($event)" accept="image/*" class="upload-input">
            </div>
          </ng-container>
          
          <ng-template #cropperTemplate>
            <div class="tabs">
              <button *ngIf="config.showCrop" class="tab-button" [class.active]="activeTab === 'crop'" (click)="activeTab = 'crop'">Crop</button>
              <button *ngIf="config.showRotate" class="tab-button" [class.active]="activeTab === 'rotate'" (click)="activeTab = 'rotate'">Rotate</button>
              <button *ngIf="config.showFlip" class="tab-button" [class.active]="activeTab === 'flip'" (click)="activeTab = 'flip'">Flip</button>
              <button *ngIf="config.showBrightness || config.showContrast || config.showSaturation" class="tab-button" [class.active]="activeTab === 'adjust'" (click)="activeTab = 'adjust'">Adjust</button>
            </div>
            
            <div class="tab-content">
              <div *ngIf="activeTab === 'crop'" class="tab-pane">
                <div class="control-group">
                  <label>Aspect Ratio</label>
                  <div class="button-group">
                    <button *ngFor="let ratio of aspectRatioOptions" 
                            class="aspect-ratio-button" 
                            [class.active]="aspectRatio === ratio.value"
                            (click)="setAspectRatio(ratio.value)">
                      {{ratio.label}}
                    </button>
                  </div>
                </div>
                <div *ngIf="config.showZoom" class="control-group">
                  <label for="zoom">Zoom</label>
                  <input id="zoom" type="range" min="1" max="3" step="0.1" [(ngModel)]="zoom" (input)="updateCrop()">
                </div>
              </div>
              <div *ngIf="activeTab === 'rotate'" class="tab-pane">
                <div class="control-group">
                  <label for="rotation">Rotation</label>
                  <input id="rotation" type="range" min="0" max="360" step="1" [(ngModel)]="rotation" (input)="updateCrop()">
                </div>
              </div>
              <div *ngIf="activeTab === 'flip'" class="tab-pane">
                <div class="control-group">
                  <button class="flip-button" (click)="flipHorizontal()">Flip Horizontal</button>
                  <button class="flip-button" (click)="flipVertical()">Flip Vertical</button>
                </div>
              </div>
              <div *ngIf="activeTab === 'adjust'" class="tab-pane">
                <div *ngIf="config.showBrightness" class="control-group">
                  <label for="brightness">Brightness</label>
                  <input id="brightness" type="range" min="0" max="2" step="0.1" [(ngModel)]="brightness" (input)="updateCrop()">
                </div>
                <div *ngIf="config.showContrast" class="control-group">
                  <label for="contrast">Contrast</label>
                  <input id="contrast" type="range" min="0" max="2" step="0.1" [(ngModel)]="contrast" (input)="updateCrop()">
                </div>
                <div *ngIf="config.showSaturation" class="control-group">
                  <label for="saturation">Saturation</label>
                  <input id="saturation" type="range" min="0" max="2" step="0.1" [(ngModel)]="saturation" (input)="updateCrop()">
                </div>
              </div>
            </div>
            
            <div class="crop-container">
              <div class="image-container" #imageContainer>
                <canvas #sourceCanvas></canvas>
                <div #cropBox class="crop-box" [style.width.px]="cropWidth" [style.height.px]="cropHeight"
                     [style.left.px]="cropX" [style.top.px]="cropY" (mousedown)="onCropBoxMouseDown($event)">
                  <div class="resize-handle top-left" (mousedown)="onResizeStart($event, 'top-left')"></div>
                  <div class="resize-handle top-right" (mousedown)="onResizeStart($event, 'top-right')"></div>
                  <div class="resize-handle bottom-left" (mousedown)="onResizeStart($event, 'bottom-left')"></div>
                  <div class="resize-handle bottom-right" (mousedown)="onResizeStart($event, 'bottom-right')"></div>
                  <div *ngIf="aspectRatio === 0" class="resize-handle top" (mousedown)="onResizeStart($event, 'top')"></div>
                  <div *ngIf="aspectRatio === 0" class="resize-handle right" (mousedown)="onResizeStart($event, 'right')"></div>
                  <div *ngIf="aspectRatio === 0" class="resize-handle bottom" (mousedown)="onResizeStart($event, 'bottom')"></div>
                  <div *ngIf="aspectRatio === 0" class="resize-handle left" (mousedown)="onResizeStart($event, 'left')"></div>
                </div>
              </div>
            </div>
            
            <div class="button-group">
              <button class="action-button secondary" (click)="cancelCrop()">Cancel</button>
              <button class="action-button warning" (click)="resetChanges()">Reset Changes</button>
              <button class="action-button primary" (click)="applyChanges()">Apply Changes</button>
            </div>
            
            <div *ngIf="croppedImageUrl" class="preview-container">
              <h5>Preview</h5>
              <img [src]="croppedImageUrl" alt="Cropped image" class="preview-image">
            </div>
            
            <div class="upload-container">
              <button class="upload-button" (click)="uploadImage()">Upload Image</button>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .image-cropper-container {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .image-cropper-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .image-cropper-body {
      padding: 20px;
    }
    .upload-container {
      text-align: center;
      margin-bottom: 20px;
    }
    .upload-label {
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: #fff;
      border-radius: 4px;
      cursor: pointer;
    }
    .upload-input {
      display: none;
    }
    .tabs {
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid #dee2e6;
    }
    .tab-button {
      padding: 10px 15px;
      border: none;
      background: none;
      cursor: pointer;
      opacity: 0.6;
    }
    .tab-button.active {
      opacity: 1;
      border-bottom: 2px solid #007bff;
    }
    .tab-content {
      margin-bottom: 20px;
    }
    .tab-pane {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .button-group {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
    }
    .aspect-ratio-button, .flip-button {
      padding: 5px 10px;
      border: 1px solid #007bff;
      background-color: #fff;
      color: #007bff;
      border-radius: 4px;
      cursor: pointer;
    }
    .aspect-ratio-button.active {
      background-color: #007bff;
      color: #fff;
    }
    .crop-container {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
      margin-bottom: 20px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .crop-box {
      position: absolute;
      border: 2px solid #fff;
      box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.5);
      cursor: move;
    }
    .resize-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: #fff;
      border: 1px solid #007bff;
    }
    .top-left { top: -5px; left: -5px; cursor: nwse-resize; }
    .top-right { top: -5px; right: -5px; cursor: nesw-resize; }
    .bottom-left { bottom: -5px; left: -5px; cursor: nesw-resize; }
    .bottom-right { bottom: -5px; right: -5px; cursor: nwse-resize; }
    .top { top: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .right { top: 50%; right: -5px; transform: translateY(-50%); cursor: ew-resize; }
    .bottom { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .left { top: 50%; left: -5px; transform: translateY(-50%); cursor: ew-resize; }
    .action-button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .action-button.primary {
      background-color: #007bff;
      color: #fff;
    }
    .action-button.secondary {
      background-color: #6c757d;
      color: #fff;
    }
    .action-button.warning {
      background-color: #ffc107;
      color: #000;
    }
    .preview-container {
      margin-top: 20px;
      text-align: center;
    }
    .preview-image {
      max-width: 100%;
      border-radius: 4px;
    }
    .upload-button {
      padding: 10px 20px;
      background-color: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    @media (max-width: 480px) {
      .image-cropper-container {
        padding: 10px;
      }
      .button-group {
        flex-direction: column;
      }
      .action-button {
        width: 100%;
      }
    }
  `]
})
export class CmImageCropperComponent implements AfterViewInit {
  @ViewChild('sourceCanvas') sourceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropBox') cropBox!: ElementRef<HTMLDivElement>;
  @ViewChild('imageContainer') imageContainer!: ElementRef<HTMLDivElement>;
  @Output() imageUploaded = new EventEmitter<File>();
  @Input() config: CropperConfig = {
    showCrop: true,
    showRotate: true,
    showFlip: true,
    showZoom: true,
    showBrightness: true,
    showContrast: true,
    showSaturation: true
  };
  @Input() aspectRatioOptions: AspectRatioOption[] = [
    { label: 'Free', value: 0 },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4/3 },
    { label: '16:9', value: 16/9 }
  ];

  imageUrl: string | null = null;
  croppedImageUrl: string | null = null;
  aspectRatio: number = 0;
  zoom: number = 1;
  rotation: number = 0;
  brightness: number = 1;
  contrast: number = 1;
  saturation: number = 1;
  cropWidth: number = 300;
  cropHeight: number = 300;
  cropX: number = 0;
  cropY: number = 0;
  imageWidth: number = 0;
  imageHeight: number = 0;
  flipX: boolean = false;
  flipY: boolean = false;
  activeTab: string = 'crop';
  
  private originalImage: HTMLImageElement | null = null;
  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private resizeHandle: string = '';
  private originalCropBox = { width: 0, height: 0, x: 0, y: 0 };
  private imageX: number = 0;
  private imageY: number = 0;

  ngAfterViewInit() {
    // Initialization if needed
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.loadImage();
      };
      reader.readAsDataURL(file);
    }
  }

  loadImage() {
    if (!this.imageUrl) return;
    
    this.originalImage = new Image();
    this.originalImage.onload = () => {
      this.imageWidth = this.originalImage!.width;
      this.imageHeight = this.originalImage!.height;
      this.resetCropBox();
      this.updateCanvas();
    };
    this.originalImage.src = this.imageUrl;
  }

  resetCropBox() {
    const containerRect = this.imageContainer.nativeElement.getBoundingClientRect();
    const containerAspectRatio = containerRect.width / containerRect.height;
    const imageAspectRatio = this.imageWidth / this.imageHeight;

    if (imageAspectRatio > containerAspectRatio) {
      this.cropWidth = containerRect.width;
      this.cropHeight = this.cropWidth / imageAspectRatio;
    } else {
      this.cropHeight = containerRect.height;
      this.cropWidth = this.cropHeight * imageAspectRatio;
    }

    this.cropX = (containerRect.width - this.cropWidth) / 2;
    this.cropY = (containerRect.height - this.cropHeight) / 2;
    this.zoom = Math.min(containerRect.width / this.imageWidth, containerRect.height / this.imageHeight);
    this.imageX = 0;
    this.imageY = 0;

    this.updateCropBoxStyle();
    this.updateCanvas();
  }

  updateCanvas() {
    if (!this.originalImage || !this.sourceCanvas) return;
    
    const canvas = this.sourceCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerRect = this.imageContainer.nativeElement.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Center the image
    ctx.translate(canvas.width / 2 + this.imageX, canvas.height / 2 + this.imageY);

    // Apply zoom
    ctx.scale(this.zoom, this.zoom);

    // Apply rotation
    ctx.rotate((this.rotation * Math.PI) / 180);

    // Apply flip
    ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);

    // Draw the image centered
    ctx.drawImage(
      this.originalImage,
      -this.imageWidth / 2,
      -this.imageHeight / 2,
      this.imageWidth,
      this.imageHeight
    );

    ctx.restore();

    // Apply color adjustments
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.applyColorAdjustments(imageData);
    ctx.putImageData(imageData, 0, 0);
  }

  setAspectRatio(ratio: number) {
    this.aspectRatio = ratio;
    if (ratio > 0) {
      const newHeight = this.cropWidth / ratio;
      if (newHeight <= this.cropHeight) {
        this.cropHeight = newHeight;
      } else {
        this.cropWidth = this.cropHeight * ratio;
      }
      this.centerCropBox();
    }
    this.updateCropBoxStyle();
  }

  centerCropBox() {
    const containerRect = this.imageContainer.nativeElement.getBoundingClientRect();
    this.cropX = (containerRect.width - this.cropWidth) / 2;
    this.cropY = (containerRect.height - this.cropHeight) / 2;
  }

  updateCropBoxStyle() {
    if (this.cropBox) {
      this.cropBox.nativeElement.style.width = `${this.cropWidth}px`;
      this.cropBox.nativeElement.style.height = `${this.cropHeight}px`;
      this.cropBox.nativeElement.style.left = `${this.cropX}px`;
      this.cropBox.nativeElement.style.top = `${this.cropY}px`;
    }
  }

  flipHorizontal() {
    this.flipX = !this.flipX;
    this.updateCanvas();
  }

  flipVertical() {
    this.flipY = !this.flipY;
    this.updateCanvas();
  }

  cancelCrop() {
    this.imageUrl = null;
    this.croppedImageUrl = null;
    this.resetChanges();
  }

  resetChanges() {
    this.aspectRatio = 0;
    this.zoom = 1;
    this.rotation = 0;
    this.brightness = 1;
    this.contrast = 1;
    this.saturation = 1;
    this.flipX = false;
    this.flipY = false;
    this.resetCropBox();
    this.updateCanvas();
  }

  applyChanges() {
    if (this.sourceCanvas && this.cropBox) {
      const sourceCanvas = this.sourceCanvas.nativeElement;
      const cropBox = this.cropBox.nativeElement;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        const cropRect = cropBox.getBoundingClientRect();
        const sourceRect = sourceCanvas.getBoundingClientRect();
        
        // Set canvas size to match crop dimensions
        tempCanvas.width = cropRect.width;
        tempCanvas.height = cropRect.height;
        
        // Calculate source coordinates
        const sx = cropRect.left - sourceRect.left;
        const sy = cropRect.top - sourceRect.top;
        
        // Draw the cropped portion
        tempCtx.drawImage(
          sourceCanvas,
          sx, sy, cropRect.width, cropRect.height,
          0, 0, tempCanvas.width, tempCanvas.height
        );
        
        this.croppedImageUrl = tempCanvas.toDataURL('image/jpeg');
      }
    }
  }

  uploadImage() {
    if (this.croppedImageUrl) {
      fetch(this.croppedImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'cropped_image.jpg', { type: 'image/jpeg' });
          this.imageUploaded.emit(file);
        });
    }
  }

  applyColorAdjustments(imageData: ImageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      data[i] = Math.min(255, data[i] * this.brightness);
      data[i + 1] = Math.min(255, data[i + 1] * this.brightness);
      data[i + 2] = Math.min(255, data[i + 2] * this.brightness);

      // Apply contrast
      for (let j = 0; j < 3; j++) {
        const channel = i + j;
        data[channel] = ((data[channel] / 255 - 0.5) * this.contrast + 0.5) * 255;
        data[channel] = Math.max(0, Math.min(255, data[channel]));
      }

      // Apply saturation
      const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
      data[i] = Math.max(0, Math.min(255, gray + (data[i] - gray) * this.saturation));
      data[i + 1] = Math.max(0, Math.min(255, gray + (data[i + 1] - gray) * this.saturation));
      data[i + 2] = Math.max(0, Math.min(255, gray + (data[i + 2] - gray) * this.saturation));
    }
  }

  onResizeStart(event: MouseEvent, handle: string) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.resizeHandle = handle;
    this.originalCropBox = {
      width: this.cropWidth,
      height: this.cropHeight,
      x: this.cropX,
      y: this.cropY
    };
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
  }

  onCropBoxMouseDown(event: MouseEvent) {
    if (event.target === this.cropBox.nativeElement) {
      this.isDragging = true;
      this.dragStartX = event.clientX - this.cropX;
      this.dragStartY = event.clientY - this.cropY;
    }
  }

  onImagePan(event: MouseEvent) {
    if (this.zoom > 1) {
      const deltaX = event.movementX;
      const deltaY = event.movementY;
      const containerRect = this.imageContainer.nativeElement.getBoundingClientRect();
      const maxPanX = (containerRect.width * (this.zoom - 1)) / 2;
      const maxPanY = (containerRect.height * (this.zoom - 1)) / 2;

      this.imageX = Math.max(-maxPanX, Math.min(maxPanX, this.imageX + deltaX));
      this.imageY = Math.max(-maxPanY, Math.min(maxPanY, this.imageY + deltaY));
      this.updateCanvas();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const containerRect = this.imageContainer.nativeElement.getBoundingClientRect();
      this.cropX = Math.max(0, Math.min(containerRect.width - this.cropWidth, event.clientX - this.dragStartX));
      this.cropY = Math.max(0, Math.min(containerRect.height - this.cropHeight, event.clientY - this.dragStartY));
      this.updateCropBoxStyle();
    } else if (this.isResizing) {
      const deltaX = event.clientX - this.dragStartX;
      const deltaY = event.clientY - this.dragStartY;
      this.resizeCropBox(deltaX, deltaY);
    } else {
      this.onImagePan(event);
    }
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }

  resizeCropBox(deltaX: number, deltaY: number) {
    const containerRect = this.imageContainer.nativeElement.getBoundingClientRect();
    const maxWidth = containerRect.width - this.originalCropBox.x;
    const maxHeight = containerRect.height - this.originalCropBox.y;

    switch (this.resizeHandle) {
      case 'top-left':
        if (this.aspectRatio === 0) {
          this.cropWidth = Math.max(20, this.originalCropBox.width - deltaX);
          this.cropHeight = Math.max(20, this.originalCropBox.height - deltaY);
          this.cropX = this.originalCropBox.x + (this.originalCropBox.width - this.cropWidth);
          this.cropY = this.originalCropBox.y + (this.originalCropBox.height - this.cropHeight);
        } else {
          const newWidth = Math.max(20, this.originalCropBox.width - deltaX);
          this.cropWidth = Math.min(newWidth, this.originalCropBox.height * this.aspectRatio);
          this.cropHeight = this.cropWidth / this.aspectRatio;
          this.cropX = this.originalCropBox.x + (this.originalCropBox.width - this.cropWidth);
          this.cropY = this.originalCropBox.y + (this.originalCropBox.height - this.cropHeight);
        }
        break;
      case 'top-right':
        if (this.aspectRatio === 0) {
          this.cropWidth = Math.min(maxWidth, Math.max(20, this.originalCropBox.width + deltaX));
          this.cropHeight = Math.max(20, this.originalCropBox.height - deltaY);
          this.cropY = this.originalCropBox.y + (this.originalCropBox.height - this.cropHeight);
        } else {
          this.cropWidth = Math.min(maxWidth, Math.max(20, this.originalCropBox.width + deltaX));
          this.cropHeight = this.cropWidth / this.aspectRatio;
          this.cropY = this.originalCropBox.y + (this.originalCropBox.height - this.cropHeight);
        }
        break;
      case 'bottom-left':
        if (this.aspectRatio === 0) {
          this.cropWidth = Math.max(20, this.originalCropBox.width - deltaX);
          this.cropHeight = Math.min(maxHeight, Math.max(20, this.originalCropBox.height + deltaY));
          this.cropX = this.originalCropBox.x + (this.originalCropBox.width - this.cropWidth);
        } else {
          const newHeight = Math.min(maxHeight, Math.max(20, this.originalCropBox.height + deltaY));
          this.cropHeight = Math.min(newHeight, this.originalCropBox.width / this.aspectRatio);
          this.cropWidth = this.cropHeight * this.aspectRatio;
          this.cropX = this.originalCropBox.x + (this.originalCropBox.width - this.cropWidth);
        }
        break;
      case 'bottom-right':
        if (this.aspectRatio === 0) {
          this.cropWidth = Math.min(maxWidth, Math.max(20, this.originalCropBox.width + deltaX));
          this.cropHeight = Math.min(maxHeight, Math.max(20, this.originalCropBox.height + deltaY));
        } else {
          const newWidth = Math.min(maxWidth, Math.max(20, this.originalCropBox.width + deltaX));
          const newHeight = Math.min(maxHeight, Math.max(20, this.originalCropBox.height + deltaY));
          if (newWidth / newHeight > this.aspectRatio) {
            this.cropWidth = newHeight * this.aspectRatio;
            this.cropHeight = newHeight;
          } else {
            this.cropWidth = newWidth;
            this.cropHeight = newWidth / this.aspectRatio;
          }
        }
        break;
      case 'top':
        if (this.aspectRatio === 0) {
          this.cropHeight = Math.max(20, this.originalCropBox.height - deltaY);
          this.cropY = this.originalCropBox.y + (this.originalCropBox.height - this.cropHeight);
        }
        break;
      case 'right':
        if (this.aspectRatio === 0) {
          this.cropWidth = Math.min(maxWidth, Math.max(20, this.originalCropBox.width + deltaX));
        }
        break;
      case 'bottom':
        if (this.aspectRatio === 0) {
          this.cropHeight = Math.min(maxHeight, Math.max(20, this.originalCropBox.height + deltaY));
        }
        break;
      case 'left':
        if (this.aspectRatio === 0) {
          this.cropWidth = Math.max(20, this.originalCropBox.width - deltaX);
          this.cropX = this.originalCropBox.x + (this.originalCropBox.width - this.cropWidth);
        }
        break;
    }

    this.updateCropBoxStyle();
  }

  @HostListener('window:resize')
  onResize() {
    this.resetCropBox();
    this.updateCanvas();
  }

  updateCrop() {
    this.updateCanvas();
  }
}