// src/app/shared/components/media-capture/media-capture.component.ts

import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-media-capture',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="media-capture-container overflow-hidden">
      <!-- Preview Area -->
      <div class="preview-box relative group bg-black min-h-[300px] rounded-xl overflow-hidden flex items-center justify-center border-2 border-gray-700">
        <video 
          *ngIf="isCameraActive" 
          #videoPlayer 
          autoplay 
          playsinline 
          webkit-playsinline
          muted 
          class="video-preview w-full h-full object-cover cursor-pointer"
          (click)="capturePhoto()"
        ></video>
        
        <img *ngIf="capturedImage && !isCameraActive" [src]="capturedImage" class="img-preview w-full h-full object-contain" />
        
        <div *ngIf="!capturedImage && !isCameraActive" class="placeholder py-8 text-center">
          <span class="material-icons text-5xl text-gray-400">photo_camera</span>
          <p class="text-sm text-gray-300 mt-2 font-medium">
            {{ errorMessage ? errorMessage : 'Cámara lista' }}
          </p>
        </div>

        <div *ngIf="isLoading" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-40">
          <span class="material-icons animate-spin text-4xl mb-2">sync</span>
          <p class="text-xs font-semibold">Iniciando cámara...</p>
        </div>

        <!-- Shutter Overlay Effect -->
        <div *ngIf="isCapturing" class="absolute inset-0 bg-white/80 animate-flash z-50"></div>
      </div>

      <!-- Controls -->
      <div class="controls flex flex-wrap gap-3 mt-6 justify-center">
        <!-- Live WebRTC Camera Toggle -->
        <app-button 
          *ngIf="!isCameraActive" 
          (click)="startCamera()"
          variant="primary"
          customClasses="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 font-bold"
        >
          <span class="material-icons">videocam</span>
          {{ capturedImage ? 'Reabrir Cámara' : 'Abrir Cámara En Vivo' }}
        </app-button>

        <!-- Native Mobile Camera Trigger (Fail-safe for iOS/Android PWA) -->
        <button 
          *ngIf="!isCameraActive"
          (click)="nativeCameraInput.click()"
          type="button"
          class="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition text-sm"
        >
          <span class="material-icons">camera_alt</span>
          Cámara Nativa (Dispositivo)
        </button>

        <app-button 
          *ngIf="isCameraActive" 
          (click)="capturePhoto()"
          variant="primary"
          customClasses="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 border-none px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 font-bold"
        >
          <span class="material-icons">photo_camera</span>
          Capturar Foto
        </app-button>

        <app-button 
          *ngIf="isCameraActive" 
          (click)="stopCamera()"
          variant="basic"
          customClasses="flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
        >
          <span class="material-icons">stop</span>
          Cerrar Cámara
        </app-button>

        <label 
          *ngIf="!isCameraActive"
          class="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-semibold border border-gray-300 dark:border-gray-600"
        >
          <span class="material-icons text-sm">file_upload</span>
          Subir de Galería
          <input type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden" />
        </label>

        <!-- Hidden Native Camera Capture Input -->
        <input 
          #nativeCameraInput 
          type="file" 
          accept="image/*" 
          capture="environment" 
          (change)="onFileSelected($event)" 
          class="hidden" 
        />
      </div>

      <canvas #captureCanvas class="hidden"></canvas>
    </div>
  `,
  styles: [`
    .media-capture-container {
      @apply w-full mx-auto;
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
  isLoading = false;
  isCapturing = false;
  errorMessage: string | null = null;
  private stream: MediaStream | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  async startCamera() {
    this.errorMessage = null;
    this.isLoading = true;
    if (this.stream) this.stopCamera();

    const constraintsList: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: 'environment' }, audio: false },
      { video: { facingMode: 'user' }, audio: false },
      { video: true, audio: false }
    ];

    let acquiredStream: MediaStream | null = null;

    for (const constraint of constraintsList) {
      try {
        acquiredStream = await navigator.mediaDevices.getUserMedia(constraint);
        if (acquiredStream) break;
      } catch (e) {
        console.warn('Constraint error on camera getUserMedia:', constraint, e);
      }
    }

    if (!acquiredStream) {
      this.isLoading = false;
      this.errorMessage = 'No se pudo acceder a la cámara. Revisa permisos o usa Cámara Nativa.';
      this.cdr.detectChanges();
      return;
    }

    this.stream = acquiredStream;
    this.isCameraActive = true;
    this.capturedImage = null;
    this.isLoading = false;
    this.cdr.detectChanges();

    setTimeout(async () => {
      if (this.videoPlayer && this.videoPlayer.nativeElement) {
        const video = this.videoPlayer.nativeElement;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.srcObject = this.stream;

        try {
          await video.play();
        } catch (playErr) {
          console.error('Video play error on mobile:', playErr);
        }
      }
    }, 150);
  }

  capturePhoto() {
    if (!this.videoPlayer || !this.captureCanvas || !this.stream) return;

    this.isCapturing = true;
    const video = this.videoPlayer.nativeElement;
    const canvas = this.captureCanvas.nativeElement;
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `rufe_evidencia_${Date.now()}.jpg`, { type: 'image/jpeg' });
          this.onCapture.emit(file);
          
          this.capturedImage = canvas.toDataURL('image/jpeg', 0.85);
          setTimeout(() => {
             this.capturedImage = null;
          }, 800);
        }
      }, 'image/jpeg', 0.85);

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
    this.isLoading = false;
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
