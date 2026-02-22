import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PermissionService } from '../../../core/services/permission.service';
import { AdminRepository, Organization } from '../../../core/repositories/admin.repository';
import { OrganizationFormDialogComponent } from './organization-form-dialog.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    OrganizationFormDialogComponent
  ],
  template: `
    <div class="p-8 animate-fade-in-up min-h-screen bg-gradient-to-br from-gray-50/50 to-emerald-50/30 dark:from-transparent dark:to-transparent">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
             Gestión de Organizaciones
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Administra las entidades y sus datos maestros</p>
        </div>
        
        <button 
          mat-flat-button 
          class="bg-emerald-600 text-white rounded-xl px-6 py-2 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform"
          *ngIf="canCreate"
          (click)="openDialog()"
        >
          <mat-icon class="mr-2">business_center</mat-icon> Nueva Organización
        </button>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organización</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NIT</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let org of organizations" class="group hover:bg-emerald-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <td class="p-4">
                   <p class="font-medium text-gray-900 dark:text-white">{{ org.nombreOrganizacion }}</p>
                   <p class="text-xs text-gray-500">{{ org.direccion || 'Sin dirección' }}</p>
                </td>
                <td class="p-4 text-gray-600 dark:text-gray-400">
                  {{ org.nit || 'N/A' }}
                </td>
                <td class="p-4">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-green-100]="org.activa"
                    [class.text-green-800]="org.activa"
                    [class.bg-red-100]="!org.activa"
                    [class.text-red-800]="!org.activa"
                  >
                     {{ org.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button mat-icon-button color="primary" *ngIf="canEdit" matTooltip="Editar" (click)="openDialog(org)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" *ngIf="canDelete" matTooltip="Eliminar" (click)="deleteOrganization(org)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="organizations.length === 0">
                <td colspan="4" class="p-12 text-center text-gray-500">
                   <mat-icon class="text-4xl mb-2 text-gray-300">corporate_fare</mat-icon>
                   <p>No hay organizaciones registradas</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class OrganizationsComponent implements OnInit {
  organizations: Organization[] = [];
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
    this.loadOrganizations();
  }

  checkPermissions() {
    this.canCreate = this.permissionService.hasPermission('organizaciones:crear');
    this.canEdit = this.permissionService.hasPermission('organizaciones:actualizar');
    this.canDelete = this.permissionService.hasPermission('organizaciones:eliminar');
  }

  loadOrganizations() {
    this.adminRepository.getOrganizations().subscribe({
      next: (data) => {
        this.organizations = data;
      },
      error: (err) => {
        console.error('Error loading organizations', err);
      }
    });
  }

  openDialog(org?: Organization) {
    console.log('Opening Organization Dialog with data:', org);
    const dialogRef = this.dialog.open(OrganizationFormDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      data: org || null,
      panelClass: 'glass-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrganizations();
      }
    });
    this.cdr.detectChanges();
  }

  deleteOrganization(org: Organization) {
    if (confirm(`¿Estás seguro de eliminar la organización ${org.nombreOrganizacion}?`)) {
      this.adminRepository.deleteOrganization(org.id!).subscribe({
        next: () => this.loadOrganizations(),
        error: (err) => console.error('Error deleting organization', err)
      });
    }
  }
}