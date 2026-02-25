import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RufeService, IRufeRemote } from '../../../core/services/rufe.service';
import { NetworkService } from '../../../core/services/network.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Reportes y Exportación
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Genera consolidados de información en formatos oficiales</p>
      </div>

      <!-- Offline Warning -->
      <div *ngIf="isOffline" class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl mb-8 flex items-center gap-4">
        <div class="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-2xl">
          <mat-icon class="text-amber-600">cloud_off</mat-icon>
        </div>
        <div>
          <h3 class="font-bold text-amber-900 dark:text-amber-200">Función solo disponible en línea</h3>
          <p class="text-amber-700 dark:text-amber-300 text-sm">Los reportes se generan dinámicamente en el servidor. Por favor, conéctate para exportar.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Filter Card -->
        <div class="md:col-span-1 bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-800">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
            <mat-icon class="text-emerald-600">filter_list</mat-icon> Filtros
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha Inicio</label>
              <input type="date" [(ngModel)]="filters.startDate" class="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha Fin</label>
              <input type="date" [(ngModel)]="filters.endDate" class="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Estado</label>
              <select [(ngModel)]="filters.status" class="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all">
                <option value="all">Todos los registros</option>
                <option value="sincronizado">Sincronizados</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Actions and Preview -->
        <div class="md:col-span-2 space-y-8">
          <!-- Export Options -->
          <div class="bg-emerald-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            
            <div class="relative z-10">
              <h2 class="text-2xl font-bold mb-2">Formatos Disponibles</h2>
              <p class="text-emerald-100 mb-8 max-w-md">Descarga el reporte detallado con todos los campos del RUFE.</p>
              
              <div class="flex flex-wrap gap-4">
                <button 
                  mat-flat-button 
                  [disabled]="isOffline || loading"
                  (click)="export('excel')"
                  class="bg-white text-emerald-700 rounded-2xl px-6 py-6 font-bold hover:scale-105 transition-transform"
                >
                  <mat-icon class="mr-2">table_view</mat-icon> Exportar Excel
                </button>
                
                <button 
                  mat-flat-button 
                  [disabled]="isOffline || loading"
                  (click)="export('pdf')"
                  class="bg-emerald-500 text-white border border-emerald-400/50 rounded-2xl px-6 py-6 font-bold hover:scale-105 transition-transform"
                >
                  <mat-icon class="mr-2">picture_as_pdf</mat-icon> Exportar PDF
                </button>
              </div>
            </div>
            
            <mat-progress-bar *ngIf="loading" mode="indeterminate" class="absolute bottom-0 left-0 right-0"></mat-progress-bar>
          </div>

          <!-- Summary Card -->
          <div class="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-800">
             <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Resumen de Registros</h2>
                <span class="px-4 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {{ rufesCount }} Encontrados
                </span>
             </div>
             
             <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ rufesCount }}</p>
                  <p class="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">Total Sincronizados</p>
                </div>
                <div class="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <p class="text-2xl font-bold text-emerald-600">100%</p>
                  <p class="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">Consistencia</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportExportComponent implements OnInit {
  filters = {
    startDate: '',
    endDate: '',
    status: 'sincronizado'
  };

  loading = false;
  isOffline = false;
  rufesCount = 0;

  constructor(
    private rufeService: RufeService,
    private networkService: NetworkService
  ) { }

  ngOnInit(): void {
    this.networkService.isOnline$.subscribe((online: boolean) => {
      this.isOffline = !online || localStorage.getItem('isOfflineSession') === 'true';
      if (online) this.updateSummary();
    });
    this.updateSummary();
  }

  async updateSummary() {
    if (this.isOffline) return;
    try {
      const rufes = await firstValueFrom(this.rufeService.getAllRufes()) as IRufeRemote[];
      this.rufesCount = rufes.length;
    } catch (e) {
      console.error('Error fetching count', e);
    }
  }

  async export(format: 'excel' | 'pdf') {
    this.loading = true;
    try {
      const obs = format === 'excel' ? this.rufeService.exportToExcel(this.filters) : this.rufeService.exportToPdf(this.filters);
      const blob = await firstValueFrom(obs) as Blob;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-rufe-${new Date().getTime()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error(`Error exporting to ${format}`, error);
      alert(`Error al generar el reporte en formato ${format}.`);
    } finally {
      this.loading = false;
    }
  }
}
