import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PermissionService } from '../../../../core/services/permission.service';

interface Organization {
  id: number;
  nombreOrganizacion: string;
  activa: boolean;
}

@Component({
  selector: 'app-organization-management',
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
           <h1 class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
             Organizaciones
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1">Gestión multitenant de clientes</p>
        </div>
        
        <button 
          mat-flat-button 
          class="bg-green-600 text-white rounded-lg px-6 py-2 shadow-lg shadow-green-500/20"
          *ngIf="canCreate"
        >
          <mat-icon class="mr-2">domain_add</mat-icon> Nueva Organización
        </button>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let org of organizations" class="group hover:bg-green-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <td class="p-4 font-bold text-gray-800 dark:text-white">
                  {{ org.nombreOrganizacion }}
                </td>
                <td class="p-4">
                   <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-green-100]="org.activa"
                    [class.text-green-800]="org.activa"
                    [class.bg-gray-100]="!org.activa"
                    [class.text-gray-800]="!org.activa"
                  >
                     {{ org.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button mat-icon-button color="primary" *ngIf="canEdit" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" *ngIf="canDelete" matTooltip="Eliminar">
                      <mat-icon>delete</mat-icon>
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
export class OrganizationManagementComponent implements OnInit {
  organizations: Organization[] = [];
  canCreate = false;
  canEdit = false;
  canDelete = false;

  constructor(private permissionService: PermissionService) { }

  ngOnInit(): void {
    this.checkPermissions();
    this.loadMockData();
  }

  checkPermissions() {
    this.canCreate = this.permissionService.hasPermission('organizaciones:crear');
    this.canEdit = this.permissionService.hasPermission('organizaciones:actualizar');
    this.canDelete = this.permissionService.hasPermission('organizaciones:eliminar');
  }

  loadMockData() {
    this.organizations = [
      { id: 1, nombreOrganizacion: 'GlobalCorp', activa: true },
      { id: 2, nombreOrganizacion: 'Cliente Demo', activa: true },
      { id: 3, nombreOrganizacion: 'Empresa Inactiva', activa: false },
    ];
  }
}
