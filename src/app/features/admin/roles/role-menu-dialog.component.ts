import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminRepository, Role } from '../../../core/repositories/admin.repository';
import { IMenuItem } from '../../../core/models/menu.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
    selector: 'app-role-menu-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        ButtonComponent
    ],
    template: `
    <div class="glass-container p-6 max-h-[90vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Asignar Menú: {{ data.nombreRol }}
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Selecciona las opciones que serán visibles para este rol.
        </p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
        <div *ngIf="loading" class="flex justify-center p-8">
          <mat-spinner strokeWidth="3" diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && allMenus.length > 0" class="space-y-4">
          <div *ngFor="let item of allMenus" class="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="material-icons text-gray-400">{{ item.icono }}</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ item.nombre }}</span>
              </div>
              <mat-checkbox 
                [checked]="isMenuSelected(item.id)" 
                (change)="toggleMenu(item.id)"
                color="primary">
              </mat-checkbox>
            </div>

            <!-- Children -->
            <div *ngIf="item.children && item.children.length > 0" class="ml-8 mt-3 space-y-2 border-l-2 border-blue-100 dark:border-blue-900/30 pl-4">
              <div *ngFor="let child of item.children" class="flex items-center justify-between py-1">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ child.nombre }}</span>
                <mat-checkbox 
                  [checked]="isMenuSelected(child.id)" 
                  (change)="toggleMenu(child.id)"
                  color="primary">
                </mat-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <app-button 
          variant="outline" 
          (click)="dialogRef.close()"
        >
          Cancelar
        </app-button>
        <app-button 
          variant="primary" 
          [loading]="saving"
          (click)="save()"
        >
          Guardar Cambios
        </app-button>
      </div>
    </div>
  `,
    styles: [`
    .glass-container {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 1.5rem;
    }
    :host-context(.dark) .glass-container {
      background: rgba(15, 23, 42, 0.7);
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }
    :host-context(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class RoleMenuDialogComponent implements OnInit {
    allMenus: IMenuItem[] = [];
    selectedIds: number[] = [];
    loading = true;
    saving = false;

    constructor(
        public dialogRef: MatDialogRef<RoleMenuDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Role,
        private adminRepo: AdminRepository,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        if (!this.data.id) return;

        this.loading = true;
        Promise.all([
            this.adminRepo.getAllMenus().toPromise(),
            this.adminRepo.getRoleMenuIds(this.data.id).toPromise()
        ]).then(([menus, ids]) => {
            this.allMenus = menus || [];
            this.selectedIds = ids || [];
            this.loading = false;
        }).catch(err => {
            console.error('Error loading menu data', err);
            this.snackBar.open('Error al cargar datos del menú', 'Cerrar', { duration: 3000 });
            this.loading = false;
        });
    }

    isMenuSelected(id: number): boolean {
        return this.selectedIds.includes(id);
    }

    toggleMenu(id: number): void {
        const index = this.selectedIds.indexOf(id);
        if (index > -1) {
            this.selectedIds.splice(index, 1);
        } else {
            this.selectedIds.push(id);
        }
    }

    save(): void {
        if (!this.data.id) return;

        this.saving = true;
        this.adminRepo.updateRoleMenus(this.data.id, this.selectedIds).subscribe({
            next: () => {
                this.snackBar.open('Menú actualizado correctamente', 'Cerrar', { duration: 3000 });
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error('Error saving menu', err);
                this.snackBar.open('Error al guardar el menú', 'Cerrar', { duration: 3000 });
                this.saving = false;
            }
        });
    }
}
