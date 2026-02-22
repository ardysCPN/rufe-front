import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PermissionService } from '../../../core/services/permission.service';
import { AdminRepository, Role } from '../../../core/repositories/admin.repository';
import { RoleFormDialogComponent } from './role-form-dialog.component';


@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="p-8 animate-fade-in-up min-h-screen bg-gradient-to-br from-gray-50/50 to-purple-50/30 dark:from-transparent dark:to-transparent">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
             Roles y Permisos
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Define los roles y asigna capacidades</p>
        </div>
        
        <button 
          mat-flat-button 
          class="bg-purple-600 text-white rounded-xl px-6 py-2 shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
          *ngIf="canCreate"
          (click)="openDialog()"
        >
          <mat-icon class="mr-2">security</mat-icon> Nuevo Rol
        </button>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden">
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
                     <button mat-icon-button color="primary" *ngIf="canEdit" matTooltip="Editar" (click)="openDialog(role)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" *ngIf="canDelete" matTooltip="Eliminar" (click)="deleteRole(role)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="roles.length === 0">
                <td colspan="3" class="p-12 text-center text-gray-500">
                   <mat-icon class="text-4xl mb-2 text-gray-300">security_update_warning</mat-icon>
                   <p>No hay roles definidos</p>
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
    private dialog: MatDialog,
    private permissionService: PermissionService,
    private adminRepository: AdminRepository,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkPermissions();
    this.loadRoles();
  }

  checkPermissions() {
    this.canCreate = this.permissionService.hasPermission('roles:crear');
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

  openDialog(role?: Role) {
    const dialogRef = this.dialog.open(RoleFormDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      data: role || null,
      panelClass: 'glass-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles();
      }
    });
    this.cdr.detectChanges();
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
