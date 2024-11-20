
# CM-ImageCropper

**CM-ImageCropper** is an Angular library for cropping images with extensive customization options. It allows free or aspect-ratio-constrained cropping, color adjustments, rotation, flipping, and more. The cropped image is returned as a file via an output event.

## Features

- Crop images freely or maintain specific aspect ratios.
- Rotate and flip images.
- Adjust brightness, contrast, saturation, and zoom.
- User-friendly interface with responsive design.
- Outputs the cropped image as a file for easy integration.

---

## Installation

Install the library using npm:

```bash
npm install cm-image-cropper
```

---

## Usage

### Import the Module

In your Angular module, include the library:

```typescript
import { CMImageCropperComponent } from 'cm-image-cropper';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CMImageCropperComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Use the Component

#### HTML

Add the cropper component to your template:

```html
<cm-image-cropper
  [imageUrl]="selectedImage"
  [config]="cropperConfig"
  [aspectRatios]="aspectRatioOptions"
  (croppedImage)="onCroppedImage($event)"
></cm-image-cropper>
```

#### Component

Define the logic in your TypeScript file:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selectedImage: string | null = null;
  cropperConfig = {
    showCrop: true,
    showRotate: true,
    showFlip: true,
    showZoom: true,
    showBrightness: true,
    showContrast: true,
    showSaturation: true
  };
  aspectRatioOptions = [
    { label: 'Free', value: 0 },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16 / 9 }
  ];

  onCroppedImage(file: File): void {
    console.log('Cropped Image:', file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
```

---

## Configuration Options

The `[config]` input accepts the following options:

| Option           | Type    | Description                                   | Default |
|-------------------|---------|-----------------------------------------------|---------|
| `showCrop`        | boolean | Enable cropping functionality                | `true`  |
| `showRotate`      | boolean | Enable rotation tools                        | `true`  |
| `showFlip`        | boolean | Enable flip tools                            | `true`  |
| `showZoom`        | boolean | Enable zoom tools                            | `true`  |
| `showBrightness`  | boolean | Enable brightness adjustment tools           | `true`  |
| `showContrast`    | boolean | Enable contrast adjustment tools             | `true`  |
| `showSaturation`  | boolean | Enable saturation adjustment tools           | `true`  |

---

## Events

- **`(croppedImage)`**: Emits the cropped image as a file.

---

## License

This library is open-source and free to use under the [MIT License](LICENSE).