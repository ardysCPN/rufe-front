// src/app/shared/components/sidebar/sidebar.component.ts

import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { MenuService } from '../../../core/services/menu.service';
import { IMenuItem } from '../../../core/models/menu.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  template: `
    <aside
      class="h-full bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-2xl overflow-y-auto transition-all duration-300 border-r border-gray-200 dark:border-gray-800 custom-scrollbar"
      [ngClass]="{
        'w-72': !collapsed || hovering,
        'w-20': collapsed && !hovering
      }"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Logo or Brand Placeholder -->
      <div class="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800 mb-4">
          <span *ngIf="!collapsed || hovering" class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RUFE App</span>
          <mat-icon *ngIf="collapsed && !hovering" class="text-blue-600">dashboard</mat-icon>
      </div>

      <nav class="space-y-2 px-3 text-sm font-medium">
        <ng-container *ngFor="let item of menuItems">
          <details *ngIf="item.children && item.children.length > 0" class="group [&_summary::-webkit-details-marker]:hidden">
            <summary
              class="flex items-center justify-between px-4 py-3 text-gray-600 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200"
              [class.bg-blue-50]="isActiveParent(item)"
              [class.text-blue-700]="isActiveParent(item)"
              [class.dark:bg-gray-800]="isActiveParent(item)"
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
                [routerLink]="subItem.ruta"
                routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200"
              >
               <span class="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
               {{ subItem.nombre }}
              </a>
            </div>
          </details>

          <a
            *ngIf="!item.children || item.children.length === 0"
            [routerLink]="item.ruta"
            routerLinkActive="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300/50 dark:shadow-none"
            #rla="routerLinkActive"
            class="flex items-center gap-4 rounded-xl px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200 group"
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
  hovering = false;
  menuItems: IMenuItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.menuService.menuItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.menuItems = items;
      });
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
