import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PermissionService } from '../../../core/services/permission.service';
import { AdminRepository, Role } from '../../../core/repositories/admin.repository';


@Component({
  selector: 'app-roles',
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
           <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
             Roles y Permisos
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1">Define los roles y asigna capacidades</p>
        </div>
        
        <button 
          mat-flat-button 
          class="bg-purple-600 text-white rounded-lg px-6 py-2 shadow-lg shadow-purple-500/20"
          *ngIf="canCreate"
        >
          <mat-icon class="mr-2">add_moderator</mat-icon> Nuevo Rol
        </button>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let role of roles" class="group hover:bg-purple-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <td class="p-4 font-medium text-gray-900 dark:text-white">
                  {{ role.nombreRol }}
                </td>
                <td class="p-4 text-gray-500">
                  {{ role.descripcion }}
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <!--
                    <button mat-icon-button class="text-purple-600" *ngIf="canEdit" matTooltip="Editar Permisos">
                      <mat-icon>lock_open</mat-icon>
                    </button>
                    -->
                     <button mat-icon-button color="primary" *ngIf="canEdit" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" *ngIf="canDelete" matTooltip="Eliminar" (click)="deleteRole(role)">
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
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  canCreate = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private permissionService: PermissionService,
    private adminRepository: AdminRepository
  ) { }

  ngOnInit(): void {
    this.checkPermissions();
    this.loadRoles();
  }

  checkPermissions() {
    this.canCreate = this.permissionService.hasPermission('roles:crear');
    // this.canEdit = this.permissionService.hasPermission('roles:actualizar');
    // Assuming update permission serves for both editing and managing permissions for now
    this.canEdit = this.permissionService.hasPermission('roles:actualizar');
    this.canDelete = this.permissionService.hasPermission('roles:eliminar');
  }

  loadRoles() {
    this.adminRepository.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Error loading roles', err);
      }
    });
  }

  deleteRole(role: Role) {
    if (confirm(`¿Estás seguro de eliminar el rol ${role.nombreRol}?`)) {
      this.adminRepository.deleteRole(role.id!).subscribe({
        next: () => this.loadRoles(),
        error: (err) => console.error('Error deleting role', err)
      });
    }
  }
}