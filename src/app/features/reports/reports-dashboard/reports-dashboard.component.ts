import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatabaseService } from '../../../core/services/database.service';
import { RufeService } from '../../../core/services/rufe.service';
import { NetworkService } from '../../../core/services/network.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Panel de Análisis de Emergencias & Reportería
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Estadísticas consolidadas del censo de damnificados y estado de salud
          </p>
        </div>

        <div class="flex gap-3">
          <button 
            mat-flat-button 
            (click)="exportExcel()" 
            class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition"
          >
            <mat-icon class="mr-2">table_view</mat-icon> Exportar Excel (.xlsx)
          </button>
          <button 
            mat-flat-button 
            (click)="goToExport()" 
            class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition"
          >
            <mat-icon class="mr-2">picture_as_pdf</mat-icon> Exportar PDF / Filtros
          </button>
        </div>
      </div>

      <!-- General KPIs Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <!-- Familias -->
        <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Familias Censadas</span>
            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <mat-icon>home</mat-icon>
            </div>
          </div>
          <p class="text-3xl font-black text-gray-900 dark:text-white">{{ totalRufes }}</p>
          <p class="text-xs text-gray-500 mt-1">Registros RUFE</p>
        </div>

        <!-- Integrantes -->
        <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Población Censada</span>
            <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <mat-icon>groups</mat-icon>
            </div>
          </div>
          <p class="text-3xl font-black text-gray-900 dark:text-white">{{ totalPersonas }}</p>
          <p class="text-xs text-gray-500 mt-1">Integrantes de hogar</p>
        </div>

        <!-- Heridos -->
        <div class="p-6 bg-amber-50 dark:bg-amber-950/30 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Heridos</span>
            <div class="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 rounded-lg">
              <mat-icon>medical_services</mat-icon>
            </div>
          </div>
          <p class="text-3xl font-black text-amber-700 dark:text-amber-300">{{ heridosCount }}</p>
          <p class="text-xs text-amber-600/80 mt-1">Leves o Graves</p>
        </div>

        <!-- Fallecidos -->
        <div class="p-6 bg-red-50 dark:bg-red-950/30 rounded-2xl shadow-sm border border-red-200 dark:border-red-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Fallecidos</span>
            <div class="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-lg">
              <mat-icon>heart_broken</mat-icon>
            </div>
          </div>
          <p class="text-3xl font-black text-red-700 dark:text-red-300">{{ fallecidosCount }}</p>
          <p class="text-xs text-red-600/80 mt-1">Confirmados en emergencia</p>
        </div>

        <!-- Desaparecidos -->
        <div class="p-6 bg-purple-50 dark:bg-purple-950/30 rounded-2xl shadow-sm border border-purple-200 dark:border-purple-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Desaparecidos</span>
            <div class="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 rounded-lg">
              <mat-icon>person_search</mat-icon>
            </div>
          </div>
          <p class="text-3xl font-black text-purple-700 dark:text-purple-300">{{ desaparecidosCount }}</p>
          <p class="text-xs text-purple-600/80 mt-1">En búsqueda activa</p>
        </div>
      </div>

      <!-- Health & Victim Analysis Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Health Status Breakdown -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <mat-icon class="text-blue-600">health_and_safety</mat-icon>
            Desglose por Estado de Salud de la Población
          </h3>

          <div class="space-y-5">
            <!-- Vivo -->
            <div>
              <div class="flex justify-between text-sm font-semibold mb-1">
                <span class="text-gray-700 dark:text-gray-300">Vivo / Sin Lesiones</span>
                <span class="text-emerald-600 font-bold">{{ vivosCount }} ({{ getPercentage(vivosCount) }}%)</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" [style.width.%]="getPercentage(vivosCount)"></div>
              </div>
            </div>

            <!-- Herido Leve -->
            <div>
              <div class="flex justify-between text-sm font-semibold mb-1">
                <span class="text-gray-700 dark:text-gray-300">Herido Leve</span>
                <span class="text-amber-500 font-bold">{{ heridosLevesCount }} ({{ getPercentage(heridosLevesCount) }}%)</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                <div class="bg-amber-400 h-full rounded-full" [style.width.%]="getPercentage(heridosLevesCount)"></div>
              </div>
            </div>

            <!-- Herido Grave -->
            <div>
              <div class="flex justify-between text-sm font-semibold mb-1">
                <span class="text-gray-700 dark:text-gray-300">Herido Grave</span>
                <span class="text-orange-600 font-bold">{{ heridosGravesCount }} ({{ getPercentage(heridosGravesCount) }}%)</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                <div class="bg-orange-500 h-full rounded-full" [style.width.%]="getPercentage(heridosGravesCount)"></div>
              </div>
            </div>

            <!-- Fallecido -->
            <div>
              <div class="flex justify-between text-sm font-semibold mb-1">
                <span class="text-gray-700 dark:text-gray-300">Fallecido</span>
                <span class="text-red-600 font-bold">{{ fallecidosCount }} ({{ getPercentage(fallecidosCount) }}%)</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                <div class="bg-red-600 h-full rounded-full" [style.width.%]="getPercentage(fallecidosCount)"></div>
              </div>
            </div>

            <!-- Desaparecido -->
            <div>
              <div class="flex justify-between text-sm font-semibold mb-1">
                <span class="text-gray-700 dark:text-gray-300">Desaparecido</span>
                <span class="text-purple-600 font-bold">{{ desaparecidosCount }} ({{ getPercentage(desaparecidosCount) }}%)</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                <div class="bg-purple-600 h-full rounded-full" [style.width.%]="getPercentage(desaparecidosCount)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Callout Banner -->
        <div class="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-2xl text-white flex flex-col justify-between shadow-xl">
          <div>
            <div class="p-3 bg-white/10 w-fit rounded-xl backdrop-blur-sm mb-4">
              <mat-icon class="text-white text-3xl">analytics</mat-icon>
            </div>
            <h2 class="text-2xl font-bold mb-2">Generación de Reportería Avanzada</h2>
            <p class="text-indigo-200 text-sm leading-relaxed mb-6">
              Exporta archivos Excel (.xlsx) con listados completos de censados, afectaciones de viviendas e integrantes de hogar, o descarga actas en PDF para comités institucionales de gestión del riesgo (CMGRD / CDGRD).
            </p>
          </div>

          <div class="flex gap-3">
            <button 
              (click)="exportExcel()" 
              type="button" 
              class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition text-sm flex items-center gap-2"
            >
              <mat-icon>file_download</mat-icon> DESCARGAR EXCEL (.XLSX)
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsDashboardComponent implements OnInit {
  totalRufes = 0;
  totalPersonas = 0;

  vivosCount = 0;
  heridosLevesCount = 0;
  heridosGravesCount = 0;
  heridosCount = 0;
  fallecidosCount = 0;
  desaparecidosCount = 0;

  constructor(
    private db: DatabaseService,
    private rufeService: RufeService,
    private networkService: NetworkService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadAnalytics();
  }

  async loadAnalytics() {
    try {
      await this.db.ensureDbReady();
      const localRufes = await this.db.rufes.toArray();
      const localIntegrantes = await this.db.integrantes.toArray();

      this.totalRufes = localRufes.length;
      this.totalPersonas = localIntegrantes.length;

      this.vivosCount = localIntegrantes.filter(i => (!i.estado_persona_id || i.estado_persona_id === 1) && !i.es_fallecido).length;
      this.heridosLevesCount = localIntegrantes.filter(i => i.estado_persona_id === 2).length;
      this.heridosGravesCount = localIntegrantes.filter(i => i.estado_persona_id === 3).length;
      this.heridosCount = this.heridosLevesCount + this.heridosGravesCount;
      this.fallecidosCount = localIntegrantes.filter(i => i.estado_persona_id === 4 || i.es_fallecido).length;
      this.desaparecidosCount = localIntegrantes.filter(i => i.estado_persona_id === 5).length;

      // If online, also try to update with remote data
      if (this.networkService.isOnline) {
        this.rufeService.getAllRufes().subscribe((remoteRufes: any[]) => {
          if (remoteRufes && remoteRufes.length > this.totalRufes) {
            this.totalRufes = remoteRufes.length;
          }
        });
      }
    } catch (err) {
      console.error('Error cargando analítica de reportes:', err);
    }
  }

  getPercentage(count: number): number {
    if (!this.totalPersonas || this.totalPersonas === 0) return 0;
    return Math.round((count / this.totalPersonas) * 100);
  }

  async exportExcel() {
    try {
      const blob = await firstValueFrom(this.rufeService.exportToExcel({})) as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-censo-rufe-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert('Para exportar el Excel en línea, asegúrese de estar autenticado y conectado al servidor.');
    }
  }

  goToExport() {
    this.router.navigate(['/reports/export']);
  }
}
