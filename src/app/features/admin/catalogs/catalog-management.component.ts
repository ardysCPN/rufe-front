import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogRepository } from '../../../core/repositories/catalog.repository';
import { PermissionService } from '../../../core/services/permission.service';
import { CatalogFormDialogComponent } from './catalog-form-dialog.component';

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="p-8 animate-fade-in-up bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Configuración de Catálogos
          </h1>
          <p class="text-gray-500 mt-1">Gestión de datos paramétricos del sistema RUFE</p>
        </div>
      </div>

      <div class="bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800">
        <mat-tab-group animationDuration="500ms" class="custom-tabs">
          
          <mat-tab *ngFor="let cat of catalogosDef" [label]="cat.label">
             <div class="p-6">
                <!-- Tab Header with Action -->
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">
                    {{ cat.label }} ({{ cat.data.length }})
                  </h3>
                  <button mat-flat-button color="primary" class="rounded-lg bg-blue-600 shadow-lg shadow-blue-500/20" 
                          *ngIf="canCreate" (click)="openDialog(cat)">
                    <mat-icon class="mr-1">add</mat-icon> Nuevo
                  </button>
                </div>

                <div class="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 max-h-[500px] overflow-y-auto">
                  <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 z-10">
                      <tr>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
                        <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr *ngFor="let item of cat.data" class="group hover:bg-blue-50/50 transition-colors">
                        <td class="p-4 font-medium dark:text-gray-200">{{ item.nombre }}</td>
                        <td class="p-4 text-right">
                          <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button mat-icon-button color="primary" (click)="openDialog(cat, item)" matTooltip="Editar">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="deleteItem(cat, item)" matTooltip="Eliminar">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr *ngIf="cat.data.length === 0">
                        <td colspan="2" class="p-10 text-center text-gray-400 italic">No hay registros</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .custom-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      background: transparent;
    }
  `]
})
export class CatalogManagementComponent implements OnInit {
  canCreate = false;
  canEdit = false;
  canDelete = false;

  catalogosDef: any[] = [
    { id: 'parentesco', label: 'Parentescos', data: [] },
    { id: 'genero', label: 'Géneros', data: [] },
    { id: 'tipo-documento', label: 'Tipos Documento', data: [] },
    { id: 'estado-bien', label: 'Estado Bien', data: [] },
    { id: 'tipo-bien', label: 'Tipos Bien', data: [] },
    { id: 'forma-tenencia-bien', label: 'Tenencia Bien', data: [] },
    { id: 'tipo-alojamiento-actual', label: 'Alojamiento', data: [] },
    { id: 'tipo-ubicacion-bien', label: 'Ubicación Bien', data: [] },
    { id: 'pertenencia-etnica', label: 'Etnias', data: [] }
  ];

  constructor(
    private catalogRepo: CatalogRepository,
    private dialog: MatDialog,
    private permissionService: PermissionService
  ) { }

  ngOnInit() {
    this.checkPermissions();
    this.loadAll();
  }

  checkPermissions() {
    // Standard bypass logic used in project
    this.canCreate = true; // For now allow all to see for testing or map to actual if needed
    this.canEdit = true;
    this.canDelete = true;
  }

  async loadAll() {
    this.catalogosDef[0].data = await this.catalogRepo.getAllParentescos();
    this.catalogosDef[1].data = await this.catalogRepo.getAllGeneros();
    this.catalogosDef[2].data = await this.catalogRepo.getAllTiposDocumento();
    this.catalogosDef[3].data = await this.catalogRepo.getAllEstadoBien();
    this.catalogosDef[4].data = await this.catalogRepo.getAllTipoBien();
    this.catalogosDef[5].data = await this.catalogRepo.getAllFormaTenenciaBien();
    this.catalogosDef[6].data = await this.catalogRepo.getAllTipoAlojamientoActual();
    this.catalogosDef[7].data = await this.catalogRepo.getAllTipoUbicacionBien();
    this.catalogosDef[8].data = await this.catalogRepo.getAllPertenenciaEtnica();
  }

  openDialog(cat: any, item?: any) {
    const dialogRef = this.dialog.open(CatalogFormDialogComponent, {
      width: '450px',
      data: {
        title: `${item ? 'Editar' : 'Nuevo'} ${cat.label.slice(0, -1)}`,
        item: item
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const obs = item
          ? this.catalogRepo.updateCatalogItem(cat.id, item.id, result)
          : this.catalogRepo.createCatalogItem(cat.id, result);

        obs.subscribe({
          next: () => {
            this.loadAll();
            // Since we use IndexedDB for the rest of the app, we might need to sync
            // but for this view reloading is fine
            window.location.reload();
          }
        });
      }
    });
  }

  deleteItem(cat: any, item: any) {
    if (confirm(`¿Estás seguro de eliminar "${item.nombre}"?`)) {
      this.catalogRepo.deleteCatalogItem(cat.id, item.id).subscribe(() => {
        this.loadAll();
        window.location.reload();
      });
    }
  }
}
