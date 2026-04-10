// src/app/shared/components/sidebar/sidebar.component.ts

import { Component, OnInit, OnDestroy, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil, Observable } from 'rxjs';

import { MenuService } from '../../../core/services/menu.service';
import { NetworkService } from '../../../core/services/network.service';
import { IMenuItem } from '../../../core/models/menu.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OfflineRestrictionModalComponent } from '../modals/offline-restriction-modal.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <aside
      class="h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transition-all duration-300 border-r border-gray-200 dark:border-gray-800 custom-scrollbar flex flex-col"
      [ngClass]="{
        'w-72': !collapsed || hovering,
        'w-0 md:w-20': collapsed && !hovering
      }"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Logo or Brand Placeholder -->
      <div class="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800 mb-2">
          <span *ngIf="!collapsed || hovering" class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RUFE</span>
          <mat-icon *ngIf="collapsed && !hovering" class="text-blue-600">dashboard</mat-icon>
      </div>

      <!-- Offline Indicator Banner -->
      <div *ngIf="isOfflineSession && (!collapsed || hovering)" class="px-4 mb-4 animate-pulse">
        <div class="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-3">
          <div class="bg-amber-500 rounded-lg p-1">
            <mat-icon class="text-white text-xs" style="width: 16px; height: 16px; font-size: 16px;">cloud_off</mat-icon>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 leading-none">Modo Local</span>
            <span class="text-[9px] text-amber-700 dark:text-amber-500 font-medium">Sin conexión</span>
          </div>
        </div>
      </div>

      <nav class="space-y-2 px-3 text-sm font-medium">
        <ng-container *ngFor="let item of menuItems">
          <!-- Item with children -->
          <details *ngIf="item.children && item.children.length > 0" class="group [&_summary::-webkit-details-marker]:hidden">
            <summary
              class="flex items-center justify-between px-4 py-3 text-gray-600 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200"
              [class.bg-blue-50]="isActiveParent(item)"
              [class.text-blue-700]="isActiveParent(item)"
              [class.dark:bg-gray-800]="isActiveParent(item)"
              [ngClass]="{'opacity-50 grayscale': isItemDisabled(item)}"
            >
              <div class="flex items-center gap-4">
                <mat-icon class="text-gray-400 group-hover:text-blue-600 transition-colors">{{ item.icono }}</mat-icon>
                <span *ngIf="!collapsed || hovering" class="truncate">{{ item.nombre }}</span>
              </div>
              <mat-icon class="text-gray-400 transition-transform duration-300 group-open:rotate-180" *ngIf="!collapsed || hovering">expand_more</mat-icon>
            </summary>

            <div class="mt-2 space-y-1 pl-4" *ngIf="!collapsed || hovering">
              <a
                *ngFor="let subItem of item.children"
                [routerLink]="isItemDisabled(subItem) ? null : subItem.ruta"
                (click)="handleItemClick(subItem, $event)"
                routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200"
                [ngClass]="{'opacity-50 grayscale': isItemDisabled(subItem)}"
              >
               <span class="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
               {{ subItem.nombre }}
              </a>
            </div>
          </details>

          <!-- Single item -->
          <a
            *ngIf="!item.children || item.children.length === 0"
            [routerLink]="isItemDisabled(item) ? null : item.ruta"
            (click)="handleItemClick(item, $event)"
            routerLinkActive="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300/50 dark:shadow-none"
            #rla="routerLinkActive"
            class="flex items-center gap-4 rounded-xl px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200 group"
            [ngClass]="{'opacity-50 grayscale': isItemDisabled(item)}"
          >
            <mat-icon [class.text-white]="rla.isActive" class="text-gray-400 group-hover:text-blue-600 transition-colors">{{ item.icono }}</mat-icon>
            <span *ngIf="!collapsed || hovering" class="truncate">{{ item.nombre }}</span>
          </a>
        </ng-container>
      </nav>
    </aside>
  `,
  styles: [`
    /* Custom Scrollbar for sleek look */
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 20px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
      background: #cbd5e1;
    }
    /* Dark mode scrollbar */
    :host-context(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed: boolean = false;
  @Output() menuClick = new EventEmitter<void>();
  hovering = false;
  menuItems: IMenuItem[] = [];
  isOfflineSession: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private menuService: MenuService,
    private networkService: NetworkService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.menuItems$ = this.menuService.menuItems$;
    
    this.menuService.menuItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.menuItems = items;
      });

    this.networkService.isOfflineSession$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOffline => {
        this.isOfflineSession = isOffline;
      });
  }
  
  menuItems$: Observable<IMenuItem[]> | undefined;

  isItemDisabled(item: IMenuItem): boolean {
    // If we are online and NOT in an enforced offline session, everything is enabled
    if (this.networkService.isOnline && !this.isOfflineSession) {
      return false;
    }

    // If offline, disable items that are NOT marked as offline-compatible.
    // The flag comes dynamically from the backend and is persisted in IndexedDB
    return !item.offline;
  }

  handleItemClick(item: IMenuItem, event: Event): void {
    if (this.isItemDisabled(item)) {
      event.preventDefault();
      event.stopPropagation();
      
      this.dialog.open(OfflineRestrictionModalComponent, {
        width: '450px',
        panelClass: 'custom-dialog-container',
        data: {
          title: 'Función No Disponible',
          message: `La sección "${item.nombre}" requiere conexión al servidor central debido a la sensibilidad de su procesamiento de datos.`
        }
      });
    } else {
      // If item is enabled and clicked, notify for auto-close behavior
      this.menuClick.emit();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMouseEnter() {
    this.hovering = true;
  }

  onMouseLeave() {
    this.hovering = false;
  }

  isActiveParent(item: IMenuItem): boolean {
    return false;
  }
}
