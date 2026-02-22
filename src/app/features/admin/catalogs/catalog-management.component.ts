import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CatalogRepository } from '../../../core/repositories/catalog.repository';
import { ICatalogoDepartamento, ICatalogoMunicipio, ICatalogoEvento } from '../../../models/catalogs.model';

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatTabsModule, MatIconModule, MatChipsModule],
  template: `
    <div class="p-8 animate-fade-in-up bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <div class="mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Configuración de Catálogos
        </h1>
        <p class="text-gray-500 mt-1">Gestión de datos paramétricos del sistema RUFE</p>
      </div>

      <div class="bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800">
        <mat-tab-group animationDuration="500ms">
          
          <mat-tab label="Departamentos">
             <div class="p-6">
                <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                  <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50/50 dark:bg-gray-800/50">
                      <tr>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr *ngFor="let d of departamentos" class="hover:bg-blue-50/50 transition-colors">
                        <td class="p-4 text-gray-400 font-mono text-xs">{{ d.id }}</td>
                        <td class="p-4 font-medium dark:text-gray-200">{{ d.nombre }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </mat-tab>

          <mat-tab label="Municipios">
            <div class="p-6">
               <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 max-h-[500px] overflow-y-auto">
                  <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50/50 dark:bg-gray-800/50 sticky top-0">
                      <tr>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Depto ID</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr *ngFor="let m of municipios" class="hover:bg-blue-50/50 transition-colors">
                        <td class="p-4 text-gray-400 font-mono text-xs">{{ m.id }}</td>
                        <td class="p-4 font-medium dark:text-gray-200">{{ m.nombre }}</td>
                        <td class="p-4"><mat-chip class="!bg-blue-100 !text-blue-700 !text-[10px]">{{ m.departamentoId }}</mat-chip></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>
          </mat-tab>

          <mat-tab label="Tipos de Evento">
             <div class="p-6">
                <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                  <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50/50 dark:bg-gray-800/50">
                      <tr>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr *ngFor="let e of eventos" class="hover:bg-purple-50/50 transition-colors">
                        <td class="p-4 text-gray-400 font-mono text-xs">{{ e.id }}</td>
                        <td class="p-4 font-medium dark:text-gray-200">{{ e.nombre }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </mat-tab>

        </mat-tab-group>
      </div>
    </div>
  `
})
export class CatalogManagementComponent implements OnInit {
  departamentos: ICatalogoDepartamento[] = [];
  municipios: ICatalogoMunicipio[] = [];
  eventos: ICatalogoEvento[] = [];

  constructor(private catalogRepo: CatalogRepository) { }

  async ngOnInit() {
    this.departamentos = await this.catalogRepo.getAllDepartamentos();
    this.municipios = await this.catalogRepo.getAllMunicipios();
    this.eventos = await this.catalogRepo.getAllEventos();
  }
}
