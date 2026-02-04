import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-report-export',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        FormsModule
    ],
    template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Exportar Datos</h1>
        <p class="text-gray-500">Genera reportes técnicos en formatos Excel o PDF</p>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="p-8 border-b border-gray-100 dark:border-gray-800">
           <h3 class="text-lg font-bold mb-6 flex items-center gap-2 text-blue-600">
             <mat-icon>tune</mat-icon> Parámetros de Exportación
           </h3>
           
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <mat-form-field appearance="outline">
                <mat-label>Evento Seleccionado</mat-label>
                <mat-select>
                  <mat-option value="all">Todos los Eventos</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rango de Fechas</mat-label>
                <input matInput [matDatepicker]="picker" placeholder="Desde - Hasta">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Departamento</mat-label>
                <input matInput>
              </mat-form-field>
           </div>
        </div>

        <div class="p-8 flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-800/20">
           <p class="text-gray-400 mb-8 max-w-md text-center">Selecciona el formato de salida para generar el reporte basado en los filtros anteriores.</p>
           
           <div class="flex gap-4">
              <button mat-flat-button class="bg-green-600 text-white px-10 py-6 text-lg rounded-2xl flex flex-col items-center hover:scale-105 transition-transform shadow-xl shadow-green-500/10">
                 <mat-icon class="scale-150 mb-2">table_view</mat-icon>
                 <span>Descargar Excel (.xlsx)</span>
              </button>

              <button mat-flat-button class="bg-red-600 text-white px-10 py-6 text-lg rounded-2xl flex flex-col items-center hover:scale-105 transition-transform shadow-xl shadow-red-500/10">
                 <mat-icon class="scale-150 mb-2">picture_as_pdf</mat-icon>
                 <span>Generar PDF</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  `
})
export class ReportExportComponent { }
