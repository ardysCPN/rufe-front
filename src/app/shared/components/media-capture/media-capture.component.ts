// src/app/shared/components/media-capture/media-capture.component.ts

import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media-capture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="media-capture-container">
      <!-- Preview Area -->
      <div class="preview-box" [class.has-media]="capturedImage">
        <img *ngIf="capturedImage" [src]="capturedImage" class="img-preview" />
        
        <video *ngIf="isCameraActive && !capturedImage" #videoPlayer autoplay playsinline class="video-preview"></video>
        
        <div *ngIf="!capturedImage && !isCameraActive" class="placeholder">
          <span class="material-icons text-4xl text-gray-400">photo_camera</span>
          <p class="text-sm text-gray-500 mt-2">No hay imagen capturada</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls flex flex-wrap gap-2 mt-4 justify-center">
        <!-- Start Camera -->
        <button 
          *ngIf="!isCameraActive && !capturedImage" 
          (click)="startCamera()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <span class="material-icons">videocam</span>
          Abrir Cámara
        </button>

        <!-- Capture Photo -->
        <button 
          *ngIf="isCameraActive && !capturedImage" 
          (click)="capturePhoto()"
          class="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
        >
          <span class="material-icons">camera</span>
          Tomar Foto
        </button>

        <!-- Stop Camera / Cancel -->
        <button 
          *ngIf="isCameraActive" 
          (click)="stopCamera()"
          class="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
        >
          <span class="material-icons">close</span>
          Cancelar
        </button>

        <!-- Upload File -->
        <label 
          *ngIf="!isCameraActive && !capturedImage"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 cursor-pointer hover:bg-purple-700 transition"
        >
          <span class="material-icons">file_upload</span>
          Subir Archivo
          <input type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden" />
        </label>

        <!-- Reset -->
        <button 
          *ngIf="capturedImage" 
          (click)="reset()"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700 transition"
        >
          <span class="material-icons">refresh</span>
          Nueva Captura
        </button>
      </div>

      <!-- Hidden Canvas for capturing -->
      <canvas #captureCanvas class="hidden"></canvas>
    </div>
  `,
  styles: [`
    .media-capture-container {
      @apply w-full max-w-md mx-auto p-4 border border-gray-200 rounded-xl bg-white shadow-sm;
    }
    .preview-box {
      @apply aspect-video w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300;
    }
    .preview-box.has-media {
      @apply border-none bg-black;
    }
    .img-preview, .video-preview {
      @apply w-full h-full object-contain;
    }
    .placeholder {
      @apply flex flex-col items-center;
    }
  `]
})
export class MediaCaptureComponent implements OnDestroy {
  @Input() label: string = 'Evidencia';
  @Output() onCapture = new EventEmitter<File>();
  @Output() onReset = new EventEmitter<void>();

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('captureCanvas') captureCanvas!: ElementRef<HTMLCanvasElement>;

  capturedImage: string | null = null;
  isCameraActive = false;
  private stream: MediaStream | null = null;

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Preferred back camera
        audio: false 
      });
      this.isCameraActive = true;
      
      // We need to wait for the view to update and render the video element
      setTimeout(() => {
        if (this.videoPlayer) {
          this.videoPlayer.nativeElement.srcObject = this.stream;
        }
      }, 0);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('No se pudo acceder a la cámara. Por favor, asegúrate de dar los permisos necesarios.');
    }
  }

  capturePhoto() {
    if (!this.videoPlayer || !this.captureCanvas) return;

    const video = this.videoPlayer.nativeElement;
    const canvas = this.captureCanvas.nativeElement;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL('image/jpeg');
      
      // Convert to File object for emission
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          this.onCapture.emit(file);
        }
      }, 'image/jpeg');

      this.stopCamera();
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.capturedImage = e.target.result;
        this.onCapture.emit(file);
      };
      reader.readAsDataURL(file);
    }
  }

  reset() {
    this.capturedImage = null;
    this.isCameraActive = false;
    this.onReset.emit();
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
