import { Component, Inject, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MediaCaptureComponent } from '../media-capture/media-capture.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-camera-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MediaCaptureComponent, ButtonComponent],
  template: `
    <div class="camera-modal-wrapper flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-h-[92dvh] h-full sm:h-auto max-w-2xl w-full mx-auto shadow-2xl border border-gray-100 dark:border-gray-700">
      
      <!-- Modal Header (Fixed / Sticky) -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-800 z-10">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <span class="material-icons text-xl">photo_camera</span>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Capturar Evidencias
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Máximo {{ maxPhotos }} fotografías por censo
            </p>
          </div>
        </div>
        <button 
          (click)="closeModal()" 
          class="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title="Cerrar modal"
        >
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Modal Body (Scrollable area) -->
      <div class="modal-scroll-body flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0 space-y-4">
        <app-media-capture 
          #mediaCapture
          [maxPhotos]="maxPhotos"
          (onCaptureListChange)="onCaptureListChange($event)">
        </app-media-capture>
      </div>

      <!-- Modal Footer (Fixed / Sticky Buttons) -->
      <div class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 z-10">
        <app-button 
          variant="basic" 
          (click)="closeModal()"
          customClasses="w-full sm:w-auto px-5 py-2.5 font-medium"
        >
          Cancelar
        </app-button>
        <app-button 
          variant="primary" 
          (click)="closeModal(capturedImages)" 
          [disabled]="capturedImages.length === 0"
          customClasses="w-full sm:w-auto px-6 py-2.5 font-bold shadow-lg shadow-blue-500/20"
        >
          <span class="material-icons text-sm mr-1">check_circle</span>
          Confirmar Fotos {{ capturedImages.length > 0 ? '(' + capturedImages.length + ')' : '' }}
        </app-button>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100vw;
    }
    .modal-scroll-body {
      scrollbar-width: thin;
      scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
    }
    .modal-scroll-body::-webkit-scrollbar {
      width: 6px;
    }
    .modal-scroll-body::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 4px;
    }
  `]
})
export class CameraModalComponent implements OnDestroy {
  @ViewChild('mediaCapture') mediaCaptureComponent?: MediaCaptureComponent;

  capturedImages: File[] = [];
  maxPhotos: number = 5;

  constructor(
    public dialogRef: MatDialogRef<CameraModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.maxPhotos) {
      this.maxPhotos = data.maxPhotos;
    }
  }

  onCaptureListChange(files: File[]) {
    this.capturedImages = files;
  }

  closeModal(result?: File[]) {
    this.mediaCaptureComponent?.stopCamera();
    this.dialogRef.close(result);
  }

  ngOnDestroy() {
    this.mediaCaptureComponent?.stopCamera();
  }
}

