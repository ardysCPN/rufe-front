import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { processImageForUpload, validateImageFile } from '../../../core/utils/image-utils';

@Component({
  selector: 'app-media-capture',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="media-capture-container w-full mx-auto select-none">
      <!-- Status & Counter Header -->
      <div class="flex justify-between items-center mb-2.5 px-0.5">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            {{ label }}
          </span>
          <span class="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            {{ capturedFiles.length }}/{{ maxPhotos }}
          </span>
        </div>
        <span 
          class="px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
          [class.bg-emerald-100]="capturedFiles.length < maxPhotos"
          [class.text-emerald-800]="capturedFiles.length < maxPhotos"
          [class.bg-amber-100]="capturedFiles.length >= maxPhotos"
          [class.text-amber-800]="capturedFiles.length >= maxPhotos"
        >
          <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-500]="capturedFiles.length < maxPhotos" [class.bg-amber-500]="capturedFiles.length >= maxPhotos"></span>
          {{ capturedFiles.length >= maxPhotos ? 'Límite alcanzado' : 'Disponible' }}
        </span>
      </div>

      <!-- Live Camera / Preview Area -->
      <div class="preview-box relative group bg-gray-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-gray-800 shadow-inner h-[230px] sm:h-[300px] md:h-[340px] w-full">
        
        <!-- Live Video Element -->
        <video 
          *ngIf="isCameraActive" 
          #videoPlayer 
          autoplay 
          playsinline 
          webkit-playsinline
          muted 
          class="video-preview w-full h-full object-cover cursor-pointer"
          (click)="capturePhoto()"
          title="Toca la pantalla para capturar foto"
        ></video>
        
        <!-- Still Image Preview when camera inactive -->
        <img 
          *ngIf="capturedImage && !isCameraActive" 
          [src]="capturedImage" 
          class="img-preview w-full h-full object-contain bg-black" 
        />
        
        <!-- Empty / Standby Placeholder -->
        <div *ngIf="!capturedImage && !isCameraActive && !isLoading" class="placeholder py-6 px-4 text-center">
          <div class="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span class="material-icons text-3xl text-gray-400">photo_camera</span>
          </div>
          <p class="text-sm font-semibold text-gray-200">
            {{ errorMessage ? errorMessage : 'Cámara en espera' }}
          </p>
          <p class="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            {{ errorMessage ? 'Intente con la cámara nativa o cargar archivos.' : 'Presione "Abrir Cámara" para activar el lente o use la cámara nativa.' }}
          </p>
        </div>

        <!-- Camera Loading Overlay -->
        <div *ngIf="isLoading" class="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
          <span class="material-icons animate-spin text-4xl mb-2 text-blue-400">sync</span>
          <p class="text-xs font-bold uppercase tracking-wider">Iniciando cámara...</p>
        </div>

        <!-- Visual Shutter Flash Effect -->
        <div *ngIf="isCapturing" class="absolute inset-0 bg-white z-40 animate-shutter-flash pointer-events-none"></div>

        <!-- Floating Confirmation Toast on Camera -->
        <div 
          *ngIf="lastCaptureSuccess" 
          class="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600/95 text-white px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 z-50 text-xs font-bold animate-pop-in backdrop-blur-sm border border-emerald-400/40"
        >
          <span class="material-icons text-base text-white animate-pulse">check_circle</span>
          <span>¡Foto #{{ capturedFiles.length }} capturada con éxito!</span>
        </div>

        <!-- Live Camera Overlay Info/Guideline -->
        <div *ngIf="isCameraActive && !isLoading" class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[11px] font-medium pointer-events-none flex items-center gap-1.5 z-20">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>En vivo • Toque para disparar</span>
        </div>
      </div>

      <!-- Action Controls -->
      <div class="controls flex flex-wrap gap-2 sm:gap-3 mt-3.5 justify-center items-center">
        
        <!-- Live WebRTC Camera Open Button -->
        <app-button 
          *ngIf="!isCameraActive" 
          (click)="startCamera()"
          [disabled]="capturedFiles.length >= maxPhotos || isProcessingCapture"
          variant="primary"
          customClasses="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 font-bold text-sm"
        >
          <span class="material-icons text-lg">videocam</span>
          {{ capturedFiles.length > 0 ? 'Abrir Cámara' : 'Abrir Cámara En Vivo' }}
        </app-button>

        <!-- Native Mobile Camera Trigger -->
        <button 
          *ngIf="!isCameraActive"
          (click)="nativeCameraInput.click()"
          [disabled]="capturedFiles.length >= maxPhotos || isProcessingCapture"
          type="button"
          class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <span class="material-icons text-lg">camera_alt</span>
          Cámara Nativa
        </button>

        <!-- Capture Trigger (When camera is live) -->
        <button 
          *ngIf="isCameraActive" 
          (click)="capturePhoto()"
          [disabled]="capturedFiles.length >= maxPhotos || isProcessingCapture"
          type="button"
          class="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl shadow-xl shadow-orange-500/30 font-bold text-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-orange-400/40"
        >
          <span class="material-icons text-xl" [class.animate-spin]="isProcessingCapture">
            {{ isProcessingCapture ? 'sync' : 'photo_camera' }}
          </span>
          <span>{{ isProcessingCapture ? 'Comprimiendo...' : 'Tomar Foto' }}</span>
        </button>

        <!-- Close Camera Button -->
        <app-button 
          *ngIf="isCameraActive" 
          (click)="stopCamera()"
          variant="basic"
          customClasses="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200"
        >
          <span class="material-icons text-base">stop</span>
          Cerrar
        </app-button>

        <!-- Upload from File/Gallery -->
        <label 
          *ngIf="!isCameraActive && capturedFiles.length < maxPhotos"
          class="px-3.5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition text-xs font-semibold border border-gray-300 dark:border-gray-600 active:scale-95"
        >
          <span class="material-icons text-base">file_upload</span>
          Subir Archivo
          <input type="file" (change)="onFileSelected($event)" accept="image/jpeg,image/png,image/webp" class="hidden" />
        </label>

        <!-- Hidden Native Camera Capture Input -->
        <input 
          #nativeCameraInput 
          type="file" 
          accept="image/jpeg,image/png,image/webp" 
          capture="environment" 
          (change)="onFileSelected($event)" 
          class="hidden" 
        />
      </div>

      <!-- Captured Photos Thumbnail Gallery Grid -->
      <div *ngIf="capturedPreviews.length > 0" #galleryContainer class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-icons text-sm text-blue-500">collections</span>
            Fotos Guardadas ({{ capturedPreviews.length }})
          </h4>
          <span class="text-[11px] text-gray-400">Toque una imagen para ampliar</span>
        </div>
        
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          <div 
            *ngFor="let preview of capturedPreviews; let i = index" 
            class="relative group rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 aspect-square bg-gray-900 shadow-sm animate-pop-in hover:border-blue-500 transition-all"
          >
            <img 
              [src]="preview" 
              (click)="openPreviewModal(preview)" 
              class="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-200" 
              alt="Foto evidencia"
            />
            <button 
              (click)="removePhoto(i)" 
              type="button" 
              title="Eliminar foto"
              class="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition shadow-md"
            >
              <span class="material-icons text-xs block">delete</span>
            </button>
            <span class="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-white text-[10px] rounded-md font-extrabold backdrop-blur-xs">
              #{{ i + 1 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Fullscreen Image Preview Lightbox Modal -->
      <div 
        *ngIf="selectedPreview" 
        class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" 
        (click)="selectedPreview = null"
      >
        <div class="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" (click)="$event.stopPropagation()">
          <img [src]="selectedPreview" class="max-w-full max-h-[82vh] rounded-xl object-contain shadow-2xl border border-gray-800" />
          <div class="flex items-center gap-3 mt-3">
            <button 
              (click)="selectedPreview = null" 
              type="button"
              class="px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span class="material-icons text-sm">close</span>
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      </div>

      <canvas #captureCanvas class="hidden"></canvas>
    </div>
  `,
  styles: [`
    .media-capture-container {
      width: 100%;
    }
    @keyframes shutterFlash {
      0% { opacity: 0.95; }
      50% { opacity: 0.6; }
      100% { opacity: 0; }
    }
    .animate-shutter-flash {
      animation: shutterFlash 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes popIn {
      0% { transform: scale(0.85); opacity: 0; }
      70% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop-in {
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
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
  @ViewChild('galleryContainer') galleryContainer?: ElementRef<HTMLDivElement>;

  capturedFiles: File[] = [];
  capturedPreviews: string[] = [];
  capturedImage: string | null = null;
  selectedPreview: string | null = null;

  isCameraActive = false;
  isLoading = false;
  isCapturing = false;
  isProcessingCapture = false;
  lastCaptureSuccess = false;
  errorMessage: string | null = null;
  private stream: MediaStream | null = null;
  private captureTimeout: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  private playShutterSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch (e) {
      // Ignorar
    }
  }

  private triggerHapticFeedback() {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 30, 40]);
      }
    } catch (e) {
      // Ignorar
    }
  }

  async startCamera() {
    if (this.capturedFiles.length >= this.maxPhotos) {
      alert(`Ha alcanzado el límite máximo de ${this.maxPhotos} fotografías por registro.`);
      return;
    }

    this.errorMessage = null;
    this.isLoading = true;
    if (this.stream) this.stopCamera();

    const constraintsList: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
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

  async capturePhoto() {
    if (!this.videoPlayer || !this.captureCanvas || !this.stream) return;
    if (this.isProcessingCapture) return;

    if (this.capturedFiles.length >= this.maxPhotos) {
      alert(`Límite de ${this.maxPhotos} fotos alcanzado.`);
      this.stopCamera();
      return;
    }

    this.isCapturing = true;
    this.isProcessingCapture = true;
    this.playShutterSound();
    this.triggerHapticFeedback();

    const video = this.videoPlayer.nativeElement;
    const canvas = this.captureCanvas.nativeElement;
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (rawBlob) => {
        if (rawBlob) {
          try {
            const processed = await processImageForUpload(rawBlob, `evidencia_${Date.now()}.jpg`, {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.82
            });

            const file = new File([processed.blob], processed.fileName, { type: 'image/jpeg' });
            const previewUrl = processed.imageBase64;

            this.capturedFiles.push(file);
            this.capturedPreviews.push(previewUrl);
            this.capturedImage = previewUrl;

            this.lastCaptureSuccess = true;
            if (this.captureTimeout) clearTimeout(this.captureTimeout);
            this.captureTimeout = setTimeout(() => {
              this.lastCaptureSuccess = false;
              this.cdr.detectChanges();
            }, 1800);

            this.onCapture.emit(file);
            this.onCaptureListChange.emit(this.capturedFiles);

            setTimeout(() => {
              if (this.galleryContainer?.nativeElement) {
                this.galleryContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }, 100);

            if (this.capturedFiles.length >= this.maxPhotos) {
              this.stopCamera();
            }
          } catch (err: any) {
            console.error('Error al procesar/comprimir imagen capturada:', err);
            alert('Error al procesar la foto: ' + (err.message || err));
          }
        }
      }, 'image/jpeg', 0.90);

      setTimeout(() => {
        this.isCapturing = false;
        this.isProcessingCapture = false;
        this.cdr.detectChanges();
      }, 400);
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

  /**
   * Detiene el MediaStream, desasocia el video.srcObject y libera completamente el hardware de la cámara.
   */
  stopCamera() {
    if (this.stream) {
      try {
        this.stream.getTracks().forEach(track => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error al detener tracks de la cámara:', e);
      }
      this.stream = null;
    }

    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      try {
        this.videoPlayer.nativeElement.pause();
        this.videoPlayer.nativeElement.srcObject = null;
      } catch (e) {
        // Ignorar
      }
    }

    this.isCameraActive = false;
    this.isLoading = false;
    this.isCapturing = false;
    this.isProcessingCapture = false;
    this.cdr.detectChanges();
  }

  async onFileSelected(event: any) {
    if (this.capturedFiles.length >= this.maxPhotos) {
      alert(`Límite máximo de ${this.maxPhotos} fotos alcanzado.`);
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        event.target.value = '';
        return;
      }

      this.isProcessingCapture = true;
      this.playShutterSound();
      this.triggerHapticFeedback();

      try {
        const processed = await processImageForUpload(file, file.name, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.82
        });

        const compressedFile = new File([processed.blob], processed.fileName, { type: 'image/jpeg' });
        const previewUrl = processed.imageBase64;

        this.capturedFiles.push(compressedFile);
        this.capturedPreviews.push(previewUrl);
        this.capturedImage = previewUrl;

        this.lastCaptureSuccess = true;
        if (this.captureTimeout) clearTimeout(this.captureTimeout);
        this.captureTimeout = setTimeout(() => {
          this.lastCaptureSuccess = false;
          this.cdr.detectChanges();
        }, 1800);

        this.onCapture.emit(compressedFile);
        this.onCaptureListChange.emit(this.capturedFiles);

        setTimeout(() => {
          if (this.galleryContainer?.nativeElement) {
            this.galleryContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      } catch (err: any) {
        console.error('Error al comprimir archivo seleccionado:', err);
        alert('Error al procesar la imagen seleccionada: ' + (err.message || err));
      } finally {
        this.isProcessingCapture = false;
        this.cdr.detectChanges();
      }
    }
    event.target.value = '';
  }

  reset() {
    this.capturedFiles = [];
    this.capturedPreviews = [];
    this.capturedImage = null;
    this.stopCamera();
    this.onReset.emit();
    this.onCaptureListChange.emit([]);
  }

  ngOnDestroy() {
    if (this.captureTimeout) clearTimeout(this.captureTimeout);
    this.stopCamera();
  }
}

