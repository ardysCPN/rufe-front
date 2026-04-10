// src/app/features/dashboard/dashboard.component.ts

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router'; // Added Router
import { MenuService } from '../../core/services/menu.service';
import { NetworkService } from '../../core/services/network.service';
import { AuthService } from '../../core/services/auth.service';
import { DatabaseService } from '../../core/services/database.service';
import { IMenuItem } from '../../core/models/menu.model'; // Added IMenuItem
import { IUser } from '../../core/models/auth.model';

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
    <div class="p-8 min-h-screen flex flex-col">
      <!-- Header Section -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Panel de Control
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Bienvenido, <span class="font-bold text-blue-600 dark:text-blue-400">{{ (authService.currentUser | async)?.email }}</span>
          </p>
        </div>
        
        <div class="flex gap-3">
           <span class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
             {{ getTodayDate() }}
           </span>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
        <!-- Pendientes de Sincronizar: Premium Gradient Card -->
        <div class="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <mat-icon style="font-size: 150px; width: 150px; height: 150px;">sync_problem</mat-icon>
          </div>
          <div class="p-6 relative z-10">
            <div class="flex items-center gap-3 mb-4 opacity-90">
              <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                 <mat-icon>cloud_off</mat-icon>
              </div>
              <span class="font-medium text-lg">Por Sincronizar</span>
            </div>
            <p class="text-5xl font-extrabold tracking-tight mb-2">{{ pendingSync }}</p>
            <p class="text-amber-100 text-sm font-medium">Registros locales pendientes</p>
          </div>
        </div>

        <!-- Total RUFE Local: Dark Minimalist Card -->
        <div class="relative group overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
           <div class="p-6">
             <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                   <div class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <mat-icon>storage</mat-icon>
                   </div>
                   <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200">Total en Dispositivo</h3>
                </div>
             </div>
             <p class="text-5xl font-extrabold text-gray-800 dark:text-white mb-2">{{ totalLocal }}</p>
             <p class="text-gray-500 dark:text-gray-400 text-sm">Registros almacenados localmente</p>
           </div>
           <div class="h-1.5 w-full bg-blue-500"></div>
        </div>

        <!-- Estado de Red: Accent Card -->
        <div 
          [ngClass]="networkService.isOnline && !isOfflineSession ? 'from-green-600 to-emerald-600' : 'from-gray-600 to-slate-700'"
          class="relative group overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
           <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
             <mat-icon style="font-size: 150px; width: 150px; height: 150px;">
               {{ networkService.isOnline && !isOfflineSession ? 'wifi' : 'wifi_off' }}
             </mat-icon>
           </div>
           <div class="p-6 relative z-10">
             <div class="flex items-center gap-3 mb-4 opacity-90">
               <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <mat-icon>{{ networkService.isOnline && !isOfflineSession ? 'signal_wifi_4_bar' : 'signal_wifi_off' }}</mat-icon>
               </div>
               <span class="font-medium text-lg">Estado de Conexión</span>
             </div>
             <p class="text-3xl font-extrabold tracking-tight mb-2 uppercase">
               {{ networkService.isOnline && !isOfflineSession ? 'En Línea' : 'Sin Conexión' }}
             </p>
             <p class="text-white/80 text-sm">
               {{ networkService.isOnline && !isOfflineSession ? 'Sincronización automática activa' : 'Trabajando con base de datos local' }}
             </p>
           </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="flex-grow">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
           <mat-icon class="text-blue-600">flash_on</mat-icon> Accesos Directos Offline
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <!-- Filtrado dinámico basado en propiedad offline -->
           <ng-container *ngFor="let item of menuItems">
             <button 
                *ngIf="item.offline && item.ruta"
                (click)="navigateTo(item.ruta)"
                class="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div class="w-14 h-14 bg-gray-50 dark:bg-gray-900/50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                   <mat-icon>{{ item.icono }}</mat-icon>
                </div>
                <span class="font-bold text-gray-700 dark:text-gray-200 text-center">{{ item.nombre }}</span>
             </button>
           </ng-container>

           <!-- Sync Manual always visible but disabled if online? -->
           <button class="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 hover:shadow-md transition-all group">
              <div class="w-14 h-14 bg-gray-50 dark:bg-gray-900/50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                 <mat-icon>sync</mat-icon>
              </div>
              <span class="font-bold text-gray-700 dark:text-gray-200 text-center">Sync Manual</span>
           </button>
        </div>
      </div>

      <!-- Enhanced Footer -->
      <footer class="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-blue-600 rounded-lg">
              <mat-icon class="text-white scale-75">terminal</mat-icon>
            </div>
            <div>
              <p class="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">ADH Solutions</p>
              <a href="https://adhsolutions.tech/" target="_blank" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">adhsolutions.tech</a>
            </div>
          </div>
          
          <div class="text-center md:text-right">
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">Soporte Técnico Especializado</p>
            <a href="mailto:zero199211@hotmail.com" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
              zero199211&#64;hotmail.com
            </a>
          </div>
        </div>
        
        <p class="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-8 uppercase tracking-widest">
           RUFE v2.0 - Registro Unifamiliar de Emergencias &copy; 2026
        </p>
      </footer>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  isBrowser: boolean;
  menuItems: IMenuItem[] = [];
  isOfflineSession: boolean = false;

  // Real data metrics
  totalLocal: number = 0;
  pendingSync: number = 0;

  constructor(
    public authService: AuthService,
    private menuService: MenuService,
    public networkService: NetworkService,
    private db: DatabaseService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit(): Promise<void> {
    if (this.isBrowser) {
      this.isOfflineSession = localStorage.getItem('isOfflineSession') === 'true';
      await this.loadMetrics();
    }

    // Subscribe to menu updates for dynamic actions
    this.menuService.menuItems$.subscribe(items => {
      this.menuItems = items;
    });

    // Subscribe to offline session changes
    this.networkService.isOfflineSession$.subscribe(isOffline => {
      this.isOfflineSession = isOffline;
      if (isOffline) {
        this.menuService.getDynamicMenu(null).subscribe();
      }
    });

    if (this.isOfflineSession || !this.networkService.isOnline) {
      this.menuService.getDynamicMenu(null).subscribe();
    } else {
      this.authService.currentUser.subscribe(user => {
        if (user) {
          this.menuService.getDynamicMenu(user).subscribe();
        }
      });
    }
  }

  async loadMetrics() {
    try {
      await this.db.ensureDbReady();
      this.totalLocal = await this.db.rufes.count();
      this.pendingSync = await this.db.rufes.where('estado_sincronizacion').equals('PENDIENTE').count();
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
    }
  }

  getTodayDate(): string {
    return new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
