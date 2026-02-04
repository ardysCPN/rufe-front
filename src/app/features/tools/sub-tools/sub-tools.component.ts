import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-sub-tools',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule],
    template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Herramientas Extra</h1>
        <p class="text-gray-500">Utilidades adicionales del sistema</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent hover:border-blue-500 transition-all text-left">
           <mat-icon class="text-blue-500 mb-4 scale-150">storage</mat-icon>
           <h3 class="font-bold text-xl mb-2 dark:text-white">Mantenimiento DB</h3>
           <p class="text-gray-400 text-sm">Optimiza y limpia la caché local del navegador.</p>
        </button>

        <button class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent hover:border-indigo-500 transition-all text-left">
           <mat-icon class="text-indigo-500 mb-4 scale-150">settings_backup_restore</mat-icon>
           <h3 class="font-bold text-xl mb-2 dark:text-white">Reiniciar Estado</h3>
           <p class="text-gray-400 text-sm">Cierra sesión y limpia todos los datos persistentes.</p>
        </button>
      </div>
    </div>
  `
})
export class SubToolsComponent { }
