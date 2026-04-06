import { Component, EventEmitter, Output, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
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
    <header class="flex justify-between items-center py-3 px-6 pt-safe bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 relative z-40">
      <div class="flex items-center gap-2 md:gap-4">
        <!-- Hamburger Button -->
        <button 
          mat-icon-button 
          (click)="onToggleSidenav()" 
          class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center"
        >
          <mat-icon>menu</mat-icon>
        </button>
        <span class="font-bold text-lg md:text-xl md:hidden truncate max-w-[150px] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RUFE</span>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <!-- Sync Status -->
        <div class="hidden sm:flex items-center gap-2" *ngIf="authService.currentUser | async">
           <button 
             mat-button 
             [disabled]="!isOnline"
             (click)="triggerSync()"
             [class.text-green-600]="isOnline && !syncing"
             [class.text-gray-400]="!isOnline"
             class="flex items-center gap-2 font-medium"
           >
             <mat-icon [class.animate-spin]="syncing">{{ getSyncIcon() }}</mat-icon>
             <span class="hidden md:inline">{{ syncing ? 'Sincronizando...' : (isOnline ? 'En línea' : 'Offline') }}</span>
           </button>
        </div>

        <app-theme-toggle-button></app-theme-toggle-button>

        <!-- Profile Dropdown -->
        <div class="relative">
          <!-- Backdrop for closing menu -->
          <div *ngIf="menuOpen" class="fixed inset-0 z-40" (click)="toggleMenu()"></div>

          <div 
            (click)="toggleMenu()"
            class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md hover:shadow-lg focus:outline-none ring-offset-2 hover:scale-105 transition-transform cursor-pointer relative z-50"
          >
            {{ userInitial }}
          </div>
          
          <!-- Dropdown Menu -->
          <div *ngIf="menuOpen" class="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 border border-gray-100 dark:border-gray-700 z-50 animate-fade-in-down overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
               <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Usuario</p>
               <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                 {{ (authService.currentUser | async)?.email }}
               </p>
            </div>
            
            <div class="p-1">
              <button 
                class="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-3 rounded-lg" 
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
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.networkService.isOnline$.subscribe(online => {
      this.isOnline = online;
      this.cdr.markForCheck();
    });
  }

  get userInitial(): string {
    const user = this.authService.currentUserValue;
    return user?.email?.charAt(0)?.toUpperCase() || '?';
  }

  onToggleSidenav(): void {
    console.log('Navbar: Toggle Sidenav signaled');
    this.toggleSidenav.emit();
    this.cdr.detectChanges();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    console.log('Navbar: Profile menu toggled to', this.menuOpen);
    this.cdr.detectChanges();
  }

  logout(): void {
    console.log('Navbar: Logging out...');
    this.authService.logout();
    this.menuOpen = false;
    this.router.navigate(['/login']);
  }

  async triggerSync() {
    if (!this.isOnline) return;
    this.syncing = true;
    this.cdr.markForCheck();
    try {
      await this.syncService.syncPending();
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      this.syncing = false;
      this.cdr.detectChanges();
    }
  }

  getSyncIcon(): string {
    if (this.syncing) return 'sync';
    return this.isOnline ? 'cloud_done' : 'wifi_off';
  }
}
