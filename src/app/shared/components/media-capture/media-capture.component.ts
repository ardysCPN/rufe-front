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
      <!-- Status & Counter Header -->
      <div class="flex justify-between items-center mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {{ label }} ({{ capturedFiles.length }} / {{ maxPhotos }} fotos)
        </span>
        <span 
          class="px-2.5 py-0.5 rounded-full text-xs font-bold"
          [class.bg-emerald-100]="capturedFiles.length < maxPhotos"
          [class.text-emerald-800]="capturedFiles.length < maxPhotos"
          [class.bg-amber-100]="capturedFiles.length >= maxPhotos"
          [class.text-amber-800]="capturedFiles.length >= maxPhotos"
        >
          {{ capturedFiles.length >= maxPhotos ? 'Límite alcanzado' : 'Disponible' }}
        </span>
      </div>

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
      <div class="controls flex flex-wrap gap-3 mt-4 justify-center">
        <!-- Live WebRTC Camera Toggle -->
        <app-button 
          *ngIf="!isCameraActive" 
          (click)="startCamera()"
          [disabled]="capturedFiles.length >= maxPhotos"
          variant="primary"
          customClasses="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 font-bold"
        >
          <span class="material-icons">videocam</span>
          {{ capturedFiles.length > 0 ? 'Tomar Otra Foto' : 'Abrir Cámara En Vivo' }}
        </app-button>

        <!-- Native Mobile Camera Trigger -->
        <button 
          *ngIf="!isCameraActive"
          (click)="nativeCameraInput.click()"
          [disabled]="capturedFiles.length >= maxPhotos"
          type="button"
          class="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="material-icons">camera_alt</span>
          Cámara Nativa (Dispositivo)
        </button>

        <app-button 
          *ngIf="isCameraActive" 
          (click)="capturePhoto()"
          [disabled]="capturedFiles.length >= maxPhotos"
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
          *ngIf="!isCameraActive && capturedFiles.length < maxPhotos"
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

      <!-- Captured Photos Thumbnail Gallery Grid -->
      <div *ngIf="capturedPreviews.length > 0" class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 class="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-3">
          Fotos Adjuntadas ({{ capturedPreviews.length }})
        </h4>
        <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <div 
            *ngFor="let preview of capturedPreviews; let i = index" 
            class="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square bg-gray-900"
          >
            <img 
              [src]="preview" 
              (click)="openPreviewModal(preview)" 
              class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
            />
            <button 
              (click)="removePhoto(i)" 
              type="button" 
              title="Eliminar foto"
              class="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition shadow"
            >
              <span class="material-icons text-xs block">delete</span>
            </button>
            <span class="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded font-bold">
              #{{ i + 1 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Fullscreen Image Preview Modal -->
      <div *ngIf="selectedPreview" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" (click)="selectedPreview = null">
        <div class="relative max-w-4xl max-h-[90vh]" (click)="$event.stopPropagation()">
          <img [src]="selectedPreview" class="max-w-full max-h-[85vh] rounded-lg object-contain" />
          <button (click)="selectedPreview = null" class="absolute top-2 right-2 p-2 bg-white/20 text-white rounded-full hover:bg-white/40">
            <span class="material-icons">close</span>
          </button>
        </div>
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
  @Input() label: string = 'Evidencia Fotográfica';
  @Input() maxPhotos: number = 5;
  @Output() onCapture = new EventEmitter<File>();
  @Output() onCaptureListChange = new EventEmitter<File[]>();
  @Output() onReset = new EventEmitter<void>();

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('captureCanvas') captureCanvas!: ElementRef<HTMLCanvasElement>;

  capturedFiles: File[] = [];
  capturedPreviews: string[] = [];
  capturedImage: string | null = null;
  selectedPreview: string | null = null;

  isCameraActive = false;
  isLoading = false;
  isCapturing = false;
  errorMessage: string | null = null;
  private stream: MediaStream | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  async startCamera() {
    if (this.capturedFiles.length >= this.maxPhotos) {
      alert(`Ha alcanzado el límite máximo de ${this.maxPhotos} fotografías por registro.`);
      return;
    }

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

    if (this.capturedFiles.length >= this.maxPhotos) {
      alert(`Límite de ${this.maxPhotos} fotos alcanzado.`);
      this.stopCamera();
      return;
    }

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
          const previewUrl = canvas.toDataURL('image/jpeg', 0.85);

          this.capturedFiles.push(file);
          this.capturedPreviews.push(previewUrl);
          this.capturedImage = previewUrl;

          this.onCapture.emit(file);
          this.onCaptureListChange.emit(this.capturedFiles);

          if (this.capturedFiles.length >= this.maxPhotos) {
            this.stopCamera();
          }
        }
      }, 'image/jpeg', 0.85);

      setTimeout(() => {
        this.isCapturing = false;
      }, 150);
    }
  }

  removePhoto(index: number) {
    if (index >= 0 && index < this.capturedFiles.length) {
      this.capturedFiles.splice(index, 1);
      this.capturedPreviews.splice(index, 1);
      if (this.capturedPreviews.length > 0) {
        this.capturedImage = this.capturedPreviews[this.capturedPreviews.length - 1];
      } else {
        this.capturedImage = null;
      }
      this.onCaptureListChange.emit(this.capturedFiles);
    }
  }

  openPreviewModal(previewUrl: string) {
    this.selectedPreview = previewUrl;
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
    if (this.capturedFiles.length >= this.maxPhotos) {
      alert(`Límite máximo de ${this.maxPhotos} fotos alcanzado.`);
      return;
    }

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        this.capturedFiles.push(file);
        this.capturedPreviews.push(previewUrl);
        this.capturedImage = previewUrl;

        this.onCapture.emit(file);
        this.onCaptureListChange.emit(this.capturedFiles);
      };
      reader.readAsDataURL(file);
    }
  }

  reset() {
    this.capturedFiles = [];
    this.capturedPreviews = [];
    this.capturedImage = null;
    this.isCameraActive = false;
    this.onReset.emit();
    this.onCaptureListChange.emit([]);
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
