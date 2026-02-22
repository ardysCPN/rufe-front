import { Component, EventEmitter, Output, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../core/services/auth.service';
import { SyncService } from '../../../core/services/sync.service';
import { NetworkService } from '../../../core/services/network.service';
import { ThemeToggleButtonComponent } from '../layout/theme-toggle-button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    ThemeToggleButtonComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <header class="flex justify-between items-center py-3 px-6 bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 relative z-40">
      <div class="flex items-center gap-2 md:gap-4">
        <button mat-icon-button (click)="onToggleSidenav($event)" class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="font-bold text-lg md:text-xl md:hidden truncate max-w-[150px] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RUFE</span>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <!-- Sync Status & Manual Trigger -->
        <div class="hidden sm:flex items-center gap-2" *ngIf="authService.currentUser | async">
           <button 
             mat-button 
             [disabled]="!isOnline"
             (click)="triggerSync()"
             [class.text-green-600]="isOnline && !syncing"
             [class.text-gray-400]="!isOnline"
             class="flex items-center gap-2 font-medium"
             matTooltip="Sincronizar datos pendientes"
           >
             <mat-icon [class.animate-spin]="syncing">{{ getSyncIcon() }}</mat-icon>
             <span class="hidden md:inline" *ngIf="syncing">Sincronizando...</span>
             <span class="hidden md:inline" *ngIf="!syncing && isOnline">En línea</span>
             <span class="hidden md:inline" *ngIf="!isOnline">Offline</span>
           </button>
        </div>

        <app-theme-toggle-button></app-theme-toggle-button>

        <!-- Profile Dropdown Trigger -->
        <div class="relative profile-menu-container">
          <div 
            (click)="toggleMenu($event)"
            class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md hover:shadow-lg focus:outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all transform hover:scale-105"
          >
            {{ userInitial }}
          </div>
          
          <!-- Dropdown Menu -->
          <div *ngIf="menuOpen" class="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 dark:border-gray-700 z-50 animate-fade-in-down">
            <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
               <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                 {{ (authService.currentUser | async)?.email }}
               </p>
               <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-medium">Panel de Usuario</p>
            </div>
            
            <div class="py-1">
              <button 
                class="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-3" 
                (click)="logout()"
              >
                <mat-icon class="!w-5 !h-5 text-base">logout</mat-icon> 
                <span class="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down {
      animation: fadeInDown 0.2s ease-out;
    }
  `]
})
export default class NavbarComponent implements OnInit {
  @Output() toggleSidenav = new EventEmitter<void>();
  menuOpen = false;
  isOnline = true;
  syncing = false;

  constructor(
    public authService: AuthService,
    private syncService: SyncService,
    private networkService: NetworkService,
    private router: Router,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.networkService.isOnline$.subscribe(online => this.isOnline = online);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.querySelector('.profile-menu-container')?.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  get userInitial(): string {
    const user = this.authService.currentUserValue;
    return user?.email?.charAt(0)?.toUpperCase() || '?';
  }

  onToggleSidenav(event: Event): void {
    event.stopPropagation();
    this.toggleSidenav.emit();
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.menuOpen = false;
    this.router.navigate(['/auth/login']);
  }

  async triggerSync() {
    if (!this.isOnline) return;

    this.syncing = true;
    try {
      await this.syncService.syncPending();
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      this.syncing = false;
    }
  }

  getSyncIcon(): string {
    if (this.syncing) return 'sync';
    if (!this.isOnline) return 'wifi_off';
    return 'cloud_done';
  }
}
