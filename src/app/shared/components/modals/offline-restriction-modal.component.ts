// src/app/shared/components/modals/offline-restriction-modal.component.ts

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-offline-restriction-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl">
      <!-- Background Decorative Gradient -->
      <div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>

      <div class="relative p-8 text-center">
        <!-- Icon Container -->
        <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/10 animate-pulse">
          <mat-icon style="font-size: 48px; width: 48px; height: 48px;" class="text-white">cloud_off</mat-icon>
        </div>

        <!-- Title -->
        <h2 class="mb-3 text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
          {{ data.title || 'Modo Offline Activo' }}
        </h2>

        <!-- Message -->
        <div class="mb-8">
          <p class="text-base leading-relaxed text-gray-600 dark:text-gray-400">
            {{ data.message || 'Esta sección requiere una conexión estable con el servidor central para garantizar la integridad y sensibilidad de los datos.' }}
          </p>
          <p class="mt-4 text-sm font-semibold text-amber-600 dark:text-amber-400">
             Por favor, reconéctate a una red para acceder a esta funcionalidad.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <button 
            mat-flat-button 
            class="h-12 w-full rounded-xl bg-gradient-to-r from-gray-800 to-gray-950 px-6 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 dark:from-blue-600 dark:to-indigo-700" 
            (click)="close()">
            Entendido, volver al inicio
          </button>
        </div>

        <!-- Support Info -->
        <p class="mt-6 text-xs font-medium text-gray-400 dark:text-gray-500">
           ADH Solutions - Soporte de Conectvidad
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      border-radius: 24px;
    }
  `]
})
export class OfflineRestrictionModalComponent {
  constructor(
    public dialogRef: MatDialogRef<OfflineRestrictionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
