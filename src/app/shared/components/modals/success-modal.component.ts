
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-success-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
    <div class="p-6 text-center">
      <div class="mb-4 text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 mat-dialog-title class="text-xl font-bold mb-2">{{ data.title || '¡Éxito!' }}</h2>
      <div mat-dialog-content class="mb-6">
        <p class="text-gray-600">{{ data.message }}</p>
      </div>
      <div mat-dialog-actions align="center">
        <button mat-flat-button color="primary" style="background-color: #2563eb !important; color: white !important;" class="w-full py-2 rounded-lg" (click)="close()">
          {{ data.buttonText || 'Aceptar' }}
        </button>
      </div>
    </div>
  `
})
export class SuccessModalComponent {
    constructor(
        public dialogRef: MatDialogRef<SuccessModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; buttonText?: string }
    ) { }

    close(): void {
        this.dialogRef.close(true);
    }
}
