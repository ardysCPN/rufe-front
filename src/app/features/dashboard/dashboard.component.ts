// src/app/features/dashboard/dashboard.component.ts

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router'; // Added Router
import { MenuService } from '../../core/services/menu.service';
import { NetworkService } from '../../core/services/network.service';
import { IMenuItem } from '../../core/models/menu.model'; // Added IMenuItem

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
    <div class="p-8">
      <!-- Header Section -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Panel de Control
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Bienvenido de nuevo, {{ (currentUser?.email) }}</p>
        </div>
        
        <div class="flex gap-3">
           <!-- Date/Time or generic info could go here -->
           <span class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
             {{ getTodayDate() }}
           </span>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
        <!-- RUFE del día: Premium Gradient Card -->
        <div class="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <mat-icon style="font-size: 150px; width: 150px; height: 150px;">insert_chart</mat-icon>
          </div>
          <div class="p-6 relative z-10">
            <div class="flex items-center gap-3 mb-4 opacity-90">
              <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                 <mat-icon>today</mat-icon>
              </div>
              <span class="font-medium text-lg">Registros Hoy</span>
            </div>
            <p class="text-5xl font-extrabold tracking-tight mb-2">128</p>
            <p class="text-blue-100 text-sm font-medium">
              <span class="bg-white/20 px-2 py-0.5 rounded text-white text-xs mr-2">+12%</span>
              vs. ayer
            </p>
          </div>
        </div>

        <!-- Total RUFE: Dark Minimalist Card -->
        <div class="relative group overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
           <div class="p-6">
             <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                   <div class="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                      <mat-icon>storage</mat-icon>
                   </div>
                   <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200">Total Acumulado</h3>
                </div>
                <!-- Sparkline placeholder or chart could go here -->
             </div>
             <p class="text-5xl font-extrabold text-gray-800 dark:text-white mb-2">4,783</p>
             <p class="text-gray-500 dark:text-gray-400 text-sm">Registros totales en plataforma</p>
           </div>
           <div class="h-1 w-full bg-green-500"></div>
        </div>

        <!-- RUFE Activos: Accent Card -->
        <div class="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
           <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
             <mat-icon style="font-size: 150px; width: 150px; height: 150px;">visibility</mat-icon>
           </div>
           <div class="p-6 relative z-10">
             <div class="flex items-center gap-3 mb-4 opacity-90">
               <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <mat-icon>remove_red_eye</mat-icon>
               </div>
               <span class="font-medium text-lg">Seguimiento Activo</span>
             </div>
             <p class="text-5xl font-extrabold tracking-tight mb-2">321</p>
             <p class="text-purple-100 text-sm">Casos que requieren atención</p>
           </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div>
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
           <mat-icon class="text-blue-600">flash_on</mat-icon> Acciones Rápidas
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <!-- Nuevo RUFE (Dynamic Check) -->
           <button 
              *ngIf="hasRoutePermission('/rufe/new')" 
              (click)="navigateTo('/rufe/new')"
              class="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow border-2 border-transparent hover:border-blue-500 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <mat-icon>add</mat-icon>
              </div>
              <span class="font-semibold text-gray-700 dark:text-gray-200">Nuevo RUFE</span>
           </button>

           <!-- Ver Registros -->
           <button 
              (click)="navigateTo('/rufe')"
              class="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow border-2 border-transparent hover:border-green-500 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div class="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <mat-icon>list</mat-icon>
              </div>
              <span class="font-semibold text-gray-700 dark:text-gray-200">Ver Registros</span>
           </button>

           <!-- Sync Manual -->
           <button class="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow border-2 border-transparent hover:border-indigo-500 hover:shadow-lg transition-all group cursor-pointer">
              <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <mat-icon>sync</mat-icon>
              </div>
              <span class="font-semibold text-gray-700 dark:text-gray-200">Sync Manual</span>
           </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  isBrowser: boolean;
  menuItems: IMenuItem[] = [];

  constructor(
    private menuService: MenuService,
    private networkService: NetworkService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    let isOfflineSession = false;
    if (this.isBrowser) {
      isOfflineSession = localStorage.getItem('isOfflineSession') === 'true';
    }

    // Subscribe to menu updates for dynamic actions
    this.menuService.menuItems$.subscribe(items => {
      this.menuItems = items;
    });

    if (isOfflineSession || !this.networkService.isOnline) {
      // Cargar datos y menú desde IndexedDB
      this.menuService.getDynamicMenu(null).subscribe();
    } else {
      // Cargar datos y menú desde el backend normalmente
      this.menuService.getDynamicMenu(this.currentUser).subscribe();
    }
  }

  getTodayDate(): string {
    return new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  hasRoutePermission(route: string): boolean {
    const find = (items: IMenuItem[]): boolean => {
      if (!items) return false;
      for (const item of items) {
        if (item.ruta === route && item.ruta !== '') return true;
        if (item.children && find(item.children)) return true;
      }
      return false;
    }
    return find(this.menuItems);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
