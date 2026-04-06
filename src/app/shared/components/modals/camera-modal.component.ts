import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MediaCaptureComponent } from '../media-capture/media-capture.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-camera-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MediaCaptureComponent, ButtonComponent],
  template: `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden relative">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Capturar Evidencias</h2>
        <button (click)="dialogRef.close()" class="text-gray-500 hover:text-gray-700">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="camera-container min-h-[400px]">
        <app-media-capture (onCapture)="onCapture($event)"></app-media-capture>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <app-button variant="basic" (click)="dialogRef.close()">Cerrar</app-button>
        <app-button variant="primary" (click)="dialogRef.close(capturedImages)" [disabled]="capturedImages.length === 0">
          Guardar {{ capturedImages.length > 0 ? '(' + capturedImages.length + ')' : '' }} Fotos
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 90vw;
    }
  `]
})
export class CameraModalComponent {
  capturedImages: File[] = [];

  constructor(
    public dialogRef: MatDialogRef<CameraModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCapture(file: File) {
    this.capturedImages.push(file);
  }
}
