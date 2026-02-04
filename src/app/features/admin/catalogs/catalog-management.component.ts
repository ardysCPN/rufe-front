import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CatalogRepository } from '../../../core/repositories/catalog.repository';

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatTabsModule, MatIconModule],
  template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Configuración de Catálogos</h1>
        <p class="text-gray-500 mt-1">Gestión de datos paramétricos del sistema RUFE</p>
      </div>

      <div class="bg-white dark:bg-gray-900/90 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <mat-tab-group>
          <mat-tab label="Ubicaciones">
             <div class="p-6">
                <p class="text-sm text-gray-500 mb-4">Departamentos y Municipios base para los registros.</p>
                <div class="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-300">
                   Vista detallada de catálogos en construcción...
                </div>
             </div>
          </mat-tab>
          <mat-tab label="Paramétricos RUFE">
            <div class="p-6">
               <p class="text-sm text-gray-500 mb-4">Tipos de documentos, géneros, parentescos, etc.</p>
               <div class="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-300">
                  Gestión de listas paramétricas en construcción...
               </div>
            </div>
          </mat-tab>
          <mat-tab label="Eventos">
             <div class="p-6">
               <p class="text-sm text-gray-500 mb-4">Configuración de tipos de emergencias permitidas.</p>
               <div class="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-300">
                  Gestión de eventos técnicos en construcción...
               </div>
             </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `
})
export class CatalogManagementComponent implements OnInit {
  constructor(private catalogRepo: CatalogRepository) { }
  ngOnInit() { }
}
