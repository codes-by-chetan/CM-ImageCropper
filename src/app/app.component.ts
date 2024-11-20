import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CmImageCropperComponent } from 'cm-image-cropper';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CmImageCropperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'CMImageCropper';
  image!: File;
  imageURL!: string;
  showcroppedIMG = false;
  HandleUpload(file:File){
    console.log(file);
    this.imageURL = this.getImageURL(file);
    this.image = file;
    this.showcroppedIMG = true;
    this.saveFileToDevice(file);
    this.cdr.detectChanges()
  }
  getImageURL(file: File){
    return URL.createObjectURL(file);
  }
  saveFileToDevice(file: File) {
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  constructor(private cdr:ChangeDetectorRef){

  }
}
