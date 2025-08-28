// src/app/features/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MenuService } from '../../core/services/menu.service';
import { NetworkService } from '../../core/services/network.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- RUFE del día -->
      <mat-card class="rounded-xl shadow-lg hover:shadow-xl transition duration-300">
        <mat-card-header>
          <mat-card-title class="text-xl font-semibold text-blue-800 flex items-center gap-2">
            <mat-icon class="text-blue-600">insert_chart</mat-icon>
            RUFE Hoy
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="text-4xl font-bold text-center text-blue-600">128</p>
          <p class="text-center text-sm text-gray-500">Registros realizados hoy</p>
        </mat-card-content>
      </mat-card>

      <!-- Total RUFE -->
      <mat-card class="rounded-xl shadow-lg hover:shadow-xl transition duration-300">
        <mat-card-header>
          <mat-card-title class="text-xl font-semibold text-green-800 flex items-center gap-2">
            <mat-icon class="text-green-600">storage</mat-icon>
            Total RUFE
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="text-4xl font-bold text-center text-green-600">4,783</p>
          <p class="text-center text-sm text-gray-500">Acumulado en la plataforma</p>
        </mat-card-content>
      </mat-card>

      <!-- RUFE activos -->
      <mat-card class="rounded-xl shadow-lg hover:shadow-xl transition duration-300">
        <mat-card-header>
          <mat-card-title class="text-xl font-semibold text-yellow-800 flex items-center gap-2">
            <mat-icon class="text-yellow-600">visibility</mat-icon>
            Activos
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="text-4xl font-bold text-center text-yellow-600">321</p>
          <p class="text-center text-sm text-gray-500">RUFE en seguimiento activo</p>
        </mat-card-content>
      </mat-card>

      <!-- Acciones rápidas -->
      <div class="col-span-1 md:col-span-2 xl:col-span-3">
        <mat-card class="rounded-lg shadow-md">
          <mat-card-header>
            <mat-card-title class="text-lg font-bold text-gray-800">Acciones Rápidas</mat-card-title>
          </mat-card-header>
          <mat-card-content class="flex flex-wrap gap-4 mt-4">
            <button mat-raised-button color="primary" class="flex items-center gap-2">
              <mat-icon>assignment</mat-icon> Ver Registros
            </button>
            <button mat-raised-button color="accent" class="flex items-center gap-2">
              <mat-icon>add_circle</mat-icon> Nuevo RUFE
            </button>
            <button mat-stroked-button color="warn" class="flex items-center gap-2">
              <mat-icon>delete</mat-icon> RUFE Inactivos
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: any; // Suponiendo que tienes un objeto de usuario actual
  
  constructor(private menuService: MenuService, private networkService: NetworkService) {}

  ngOnInit(): void {
    const isOfflineSession = localStorage.getItem('isOfflineSession') === 'true';
    if (isOfflineSession || !this.networkService.isOnline) {
      // Cargar datos y menú desde IndexedDB
      this.menuService.getDynamicMenu(null).subscribe();
      // Aquí puedes cargar otros datos desde IndexedDB
    } else {
      // Cargar datos y menú desde el backend normalmente
      this.menuService.getDynamicMenu(this.currentUser).subscribe();
      // Aquí puedes cargar otros datos desde el backend
    }
  }
}
