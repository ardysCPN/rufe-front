// src/app/features/admin/menu/menu-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuManagementService } from '../../../core/services/menu-management.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatTableModule, 
    MatSlideToggleModule, 
    MatIconModule, 
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="p-6">
      <!-- Header Area -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Configuración de <span class="text-blue-600">Menú Dinámico</span>
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona la disponibilidad de módulos en modo offline. (Total: {{ flatMenuItems.length }})
          </p>
        </div>
        <button mat-flat-button color="primary" class="rounded-xl h-12 px-6" (click)="loadMenus()" [disabled]="loading">
          <mat-icon class="mr-2">{{ loading ? 'hourglass_empty' : 'refresh' }}</mat-icon> 
          {{ loading ? 'Cargando...' : 'Recargar Menú' }}
        </button>
      </div>

      <!-- Table Section -->
      <div class="grid grid-cols-1 gap-6">
        <mat-card class="overflow-hidden border-none shadow-xl bg-white dark:bg-gray-900 rounded-3xl ring-1 ring-gray-200 dark:ring-gray-800">
          <div class="overflow-x-auto min-h-[200px]">
            <table mat-table [dataSource]="flatMenuItems" class="w-full">
              
              <ng-container matColumnDef="icono">
                <th mat-header-cell *matHeaderCellDef class="px-6 py-4 text-xs font-bold uppercase text-gray-400"> Icono </th>
                <td mat-cell *matCellDef="let item" class="px-6 py-4">
                  <mat-icon class="text-blue-600">{{ item.icono || 'help_outline' }}</mat-icon>
                </td>
              </ng-container>

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef class="px-6 py-4 text-xs font-bold uppercase text-gray-400"> Nombre </th>
                <td mat-cell *matCellDef="let item" class="px-6 py-4">
                  <div class="flex flex-col" [style.padding-left.px]="item.parentId ? 24 : 0">
                    <span class="font-bold text-gray-900 dark:text-white">{{ item.nombre }}</span>
                    <span class="text-xs text-gray-500">{{ item.ruta }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="offline">
                <th mat-header-cell *matHeaderCellDef class="px-6 py-4 text-xs font-bold uppercase text-gray-400"> Offline </th>
                <td mat-cell *matCellDef="let item" class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <mat-slide-toggle 
                      [checked]="item.offlineCompatible" 
                      (change)="toggleOffline(item, $event.checked)"
                      color="primary">
                    </mat-slide-toggle>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="px-6 py-4 text-xs font-bold uppercase text-gray-400"> Estado </th>
                <td mat-cell *matCellDef="let item" class="px-6 py-4">
                  <span [ngClass]="item.offlineCompatible ? 'text-green-600' : 'text-gray-400'" class="text-xs font-medium">
                    {{ item.offlineCompatible ? 'Habilitado' : 'Solo Online' }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"></tr>
            </table>

            <div *ngIf="!loading && flatMenuItems.length === 0" class="p-12 text-center text-gray-400">
              <mat-icon class="text-4xl mb-2">info</mat-icon>
              <p>No se encontraron datos para mostrar.</p>
            </div>
            
            <div *ngIf="loading" class="p-12 text-center text-gray-500">
              <p class="animate-pulse">Cargando menú dinámico...</p>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .mat-mdc-table { background: transparent !important; }
  `]
})
export class MenuManagementComponent implements OnInit {
  flatMenuItems: any[] = [];
  displayedColumns: string[] = ['icono', 'nombre', 'offline', 'status'];
  loading = false;

  constructor(
    private menuManagementService: MenuManagementService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('MenuManagementComponent inicializado');
    this.loadMenus();
  }

  loadMenus(): void {
    console.log('Cargando menús desde el servicio...');
    this.loading = true;
    this.menuManagementService.getAllMenus().subscribe({
      next: (menus) => {
        console.log('Datos recibidos del backend:', menus);
        this.flatMenuItems = this.flattenMenus(menus);
        console.log('Datos procesados (flat):', this.flatMenuItems);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar menús:', err);
        this.snackBar.open('Error al cargar la configuración', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  flattenMenus(menus: any[], parentId: number | null = null): any[] {
    if (!menus) return [];
    let result: any[] = [];
    menus.forEach(item => {
      result.push({
        id: item.id,
        nombre: item.nombre,
        ruta: item.ruta,
        icono: item.icono,
        orden: item.orden,
        offlineCompatible: item.offlineCompatible,
        parentId: parentId
      });
      if (item.children && item.children.length > 0) {
        result = result.concat(this.flattenMenus(item.children, item.id));
      }
    });
    return result;
  }

  toggleOffline(item: any, checked: boolean): void {
    this.menuManagementService.updateOfflineStatus(item.id, checked).subscribe({
      next: () => {
        item.offlineCompatible = checked;
        this.snackBar.open(`"${item.nombre}" actualizado`, 'OK', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
