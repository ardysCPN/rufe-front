import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { PermissionService } from '../../../core/services/permission.service';
import { AdminRepository, User } from '../../../core/repositories/admin.repository';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="p-8 animate-fade-in-up">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
             Gestión de Usuarios
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1">Administra los accesos y roles de tu organización</p>
        </div>
        
        <button 
          mat-flat-button 
          color="primary" 
          *ngIf="canCreate"
          class="rounded-lg px-6 py-2 shadow-lg shadow-blue-500/20"
        >
          <mat-icon class="mr-2">add</mat-icon> Nuevo Usuario
        </button>
      </div>

      <!-- Table Card -->
      <div class="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let user of users" class="group hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                      {{ user.nombreCompleto.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ user.nombreCompleto }}</p>
                      <p class="text-xs text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                     {{ user.rolNombre }}
                  </span>
                </td>
                <td class="p-4">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-green-100]="user.activo"
                    [class.text-green-800]="user.activo"
                    [class.bg-red-100]="!user.activo"
                    [class.text-red-800]="!user.activo"
                  >
                     {{ user.activo ? 'Activo' : 'Inactivo' }}
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
              
              <!-- Empty State -->
              <tr *ngIf="users.length === 0">
                <td colspan="4" class="p-12 text-center text-gray-500">
                   <mat-icon class="text-4xl mb-2 text-gray-300">people_outline</mat-icon>
                   <p>No hay usuarios registrados</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination Placeholder -->
        <div class="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end text-sm text-gray-500">
           Mostrando 1 - {{ users.length }} de {{ users.length }}
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  canCreate = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private permissionService: PermissionService,
    private adminRepository: AdminRepository
  ) { }

  ngOnInit(): void {
    this.checkPermissions();
    this.loadUsers();
  }

  checkPermissions() {
    this.canCreate = this.permissionService.hasPermission('usuarios:crear');
    this.canEdit = this.permissionService.hasPermission('usuarios:actualizar');
    this.canDelete = this.permissionService.hasPermission('usuarios:eliminar');
  }

  loadUsers() {
    this.adminRepository.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error loading users', err);
        // TODO: Show error notification
      }
    });
  }

  deleteUser(user: User) {
    if (confirm(`¿Estás seguro de eliminar a ${user.nombreCompleto}?`)) {
      this.adminRepository.deleteUser(user.id!).subscribe({
        next: () => {
          this.loadUsers(); // Refresh list
        },
        error: (err) => {
          console.error('Error deleting user', err);
        }
      });
    }
  }
}