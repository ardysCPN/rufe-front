import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rufe-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="p-8 animate-fade-in-up">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
             Registros RUFE
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1">Consulta y gestiona los registros unicos</p>
        </div>
        
        <button 
          mat-flat-button 
          color="primary" 
          (click)="createNew()"
          class="rounded-lg px-6 py-2 shadow-lg shadow-blue-500/20"
        >
          <mat-icon class="mr-2">add</mat-icon> Nuevo Registro
        </button>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Folio</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Beneficiario</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado Sync</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let item of rufes" class="group hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <td class="p-4 text-gray-500 font-mono text-xs">
                  {{ item.fecha }}
                </td>
                <td class="p-4 font-semibold text-gray-900 dark:text-gray-200">
                  {{ item.folio }}
                </td>
                <td class="p-4 text-gray-700 dark:text-gray-300">
                   {{ item.beneficiario }}
                </td>
                <td class="p-4">
                   <div class="flex items-center gap-1">
                      <mat-icon class="text-xs" [class.text-green-500]="item.sync" [class.text-orange-500]="!item.sync">
                        {{ item.sync ? 'cloud_done' : 'cloud_off' }}
                      </mat-icon>
                      <span class="text-xs text-gray-500">{{ item.sync ? 'Sincronizado' : 'Pendiente' }}</span>
                   </div>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button mat-icon-button color="primary" matTooltip="Ver detalles">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="accent" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RufeListComponent implements OnInit {
  rufes: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Mock Data
    this.rufes = [
      { fecha: '2024-01-19', folio: 'RF-2024-001', beneficiario: 'Maria Gonzalez', sync: true },
      { fecha: '2024-01-19', folio: 'RF-2024-002', beneficiario: 'Pedro Martinez', sync: false },
      { fecha: '2024-01-18', folio: 'RF-2024-003', beneficiario: 'Laura Silva', sync: true },
    ];
  }

  createNew() {
    this.router.navigate(['/rufe/new']);
  }
}