// src/app/shared/components/media-capture/media-capture.component.ts

import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-media-capture',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="media-capture-container overflow-hidden">
      <!-- Preview Area -->
      <div class="preview-box relative group" [class.has-media]="capturedImage && !isCameraActive">
        <video 
          *ngIf="isCameraActive" 
          #videoPlayer 
          autoplay 
          playsinline 
          muted 
          class="video-preview w-full h-full object-cover cursor-pointer"
          (dblclick)="capturePhoto()"
        ></video>
        
        <img *ngIf="capturedImage && !isCameraActive" [src]="capturedImage" class="img-preview" />
        
        <div *ngIf="!capturedImage && !isCameraActive" class="placeholder py-8">
          <span class="material-icons text-5xl text-gray-300">photo_camera</span>
          <p class="text-sm text-gray-500 mt-2 font-medium">Cámara lista</p>
        </div>

        <!-- Shutter Overlay Effect -->
        <div *ngIf="isCapturing" class="absolute inset-0 bg-white/80 animate-flash z-50"></div>
      </div>

      <!-- Controls -->
      <div class="controls flex flex-wrap gap-3 mt-6 justify-center">
        <app-button 
          *ngIf="!isCameraActive" 
          (click)="startCamera()"
          variant="primary"
          customClasses="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 font-bold"
        >
          <span class="material-icons">videocam</span>
          {{ capturedImage ? 'Cambiar Foto' : 'Abrir Cámara' }}
        </app-button>

        <app-button 
          *ngIf="isCameraActive" 
          (click)="capturePhoto()"
          variant="primary"
          customClasses="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 border-none px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 font-bold"
        >
          <span class="material-icons">photo_camera</span>
          Capturar
        </app-button>

        <app-button 
          *ngIf="isCameraActive" 
          (click)="stopCamera()"
          variant="basic"
          customClasses="flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
        >
          <span class="material-icons">stop</span>
          Finalizar
        </app-button>

        <label 
          *ngIf="!isCameraActive"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition text-sm font-semibold border border-gray-300"
        >
          <span class="material-icons text-sm">file_upload</span>
          Subir
          <input type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden" />
        </label>
      </div>

      <canvas #captureCanvas class="hidden"></canvas>
    </div>
  `,
  styles: [`
    .media-capture-container {
      @apply w-full mx-auto;
    }
    .preview-box {
      @apply aspect-[4/3] w-full bg-black rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-700;
    }
    .video-preview, .img-preview {
      @apply w-full h-full object-contain;
    }
    .animate-flash {
      animation: flash 0.15s ease-out;
    }
    @keyframes flash {
      0% { opacity: 0.8; }
      100% { opacity: 0; }
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
  isCapturing = false;
  private stream: MediaStream | null = null;

  async startCamera() {
    try {
      if (this.stream) this.stopCamera();

      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera by default
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false 
      });
      this.isCameraActive = true;
      this.capturedImage = null;
      
      // Wait for Angular to render the video element after setting isCameraActive = true
      setTimeout(() => {
        if (this.videoPlayer) {
          const video = this.videoPlayer.nativeElement;
          video.srcObject = this.stream;
          video.onloadedmetadata = () => {
            video.play().catch(e => console.error('Error playing video:', e));
          };
        }
      }, 300);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Error: No se pudo activar la cámara. Verifique los permisos.');
    }
  }

  capturePhoto() {
    if (!this.videoPlayer || !this.captureCanvas || !this.stream) return;

    this.isCapturing = true;
    const video = this.videoPlayer.nativeElement;
    const canvas = this.captureCanvas.nativeElement;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `rufe_evidencia_${Date.now()}.jpg`, { type: 'image/jpeg' });
          this.onCapture.emit(file);
          
          // Show a quick preview of the last capture
          this.capturedImage = canvas.toDataURL('image/jpeg', 0.7);
          setTimeout(() => {
             this.capturedImage = null; // Clear preview to show live video again
          }, 800);
        }
      }, 'image/jpeg', 0.8);

      setTimeout(() => {
        this.isCapturing = false;
      }, 150);
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
