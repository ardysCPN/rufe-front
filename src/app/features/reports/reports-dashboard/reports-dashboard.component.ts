import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-reports-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
    template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Panel de Reportes</h1>
        <p class="text-gray-500">Visualización de datos e indicadores generales</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Mock Charts / Stats -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
           <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-gray-700 dark:text-gray-200">RUFEs por Evento</h3>
              <mat-icon class="text-blue-500">bar_chart</mat-icon>
           </div>
           <div class="h-40 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-gray-400 italic">Espacio para gráfico de barras</span>
           </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
           <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-gray-700 dark:text-gray-200">Distribución Geográfica</h3>
              <mat-icon class="text-indigo-500">pie_chart</mat-icon>
           </div>
           <div class="h-40 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-gray-400 italic">Espacio para gráfico de torta</span>
           </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
           <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-gray-700 dark:text-gray-200">Tendencia de Sincronización</h3>
              <mat-icon class="text-green-500">show_chart</mat-icon>
           </div>
           <div class="h-40 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
              <span class="text-gray-400 italic">Espacio para gráfico de líneas</span>
           </div>
        </div>
      </div>

      <div class="mt-8 bg-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between">
         <div class="mb-4 md:mb-0">
            <h2 class="text-xl font-bold">¿Necesitas datos detallados?</h2>
            <p class="text-indigo-100">Accede al módulo de exportación para generar archivos Excel o PDF personalizados.</p>
         </div>
         <button mat-flat-button class="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold">
            Ir a Exportar
         </button>
      </div>
    </div>
  `
})
export class ReportsDashboardComponent { }
