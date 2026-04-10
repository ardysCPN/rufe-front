// src/app/shared/components/modals/confirm-modal.component.ts

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="p-6 text-center">
      <div class="mb-4" [ngClass]="data.isWarning ? 'text-amber-500' : 'text-blue-500'">
        <mat-icon style="font-size: 64px; width: 64px; height: 64px;" class="mx-auto">{{ data.icon || 'help_outline' }}</mat-icon>
      </div>
      <h2 mat-dialog-title class="text-xl font-bold mb-2">{{ data.title }}</h2>
      <div mat-dialog-content class="mb-6">
        <p class="text-gray-600">{{ data.message }}</p>
      </div>
      <div mat-dialog-actions class="flex gap-3 justify-center">
        <button mat-stroked-button class="flex-1 py-2 rounded-lg" (click)="cancel()">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button mat-flat-button 
                [color]="data.isWarning ? 'warn' : 'primary'" 
                [style.background-color]="data.isWarning ? '#ef4444' : '#2563eb'"
                class="flex-1 py-2 rounded-lg text-white" 
                (click)="confirm()">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { 
          title: string; 
          message: string; 
          confirmText?: string; 
          cancelText?: string;
          isWarning?: boolean;
          icon?: string;
        }
    ) { }

    confirm(): void {
        this.dialogRef.close(true);
    }

    cancel(): void {
        this.dialogRef.close(false);
    }
}
