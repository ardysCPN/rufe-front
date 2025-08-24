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
      class="h-screen bg-white dark:bg-gray-900 shadow-lg p-2 overflow-y-auto transition-all duration-300"
      [ngClass]="{
        'w-64': !collapsed || hovering,
        'w-20': collapsed && !hovering
      }"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <nav class="space-y-2 text-sm font-medium">
        <ng-container *ngFor="let item of menuItems">
          <details *ngIf="item.subItems && item.subItems.length > 0" class="group [&_summary::-webkit-details-marker]:hidden">
            <summary
              class="flex items-center justify-between px-4 py-2 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              [class.bg-gray-200]="isActiveParent(item)"
              [class.text-blue-600]="isActiveParent(item)"
              [class.dark:bg-gray-800]="isActiveParent(item)"
            >
              <span class="flex gap-3 items-center">
                <mat-icon>{{ item.icono }}</mat-icon>
                <span *ngIf="!collapsed || hovering">{{ item.nombreItem }}</span>
              </span>
              <mat-icon class="transition-transform group-open:rotate-180" *ngIf="!collapsed || hovering">expand_more</mat-icon>
            </summary>

            <div class="mt-2 space-y-1 pl-10" *ngIf="!collapsed || hovering">
              <a
                *ngFor="let subItem of item.subItems"
                [routerLink]="subItem.ruta"
                routerLinkActive="text-blue-600 dark:text-white font-semibold"
                class="block text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                {{ subItem.nombreItem }}
              </a>
            </div>
          </details>

          <a
            *ngIf="!item.subItems || item.subItems.length === 0"
            [routerLink]="item.ruta"
            routerLinkActive="bg-gray-200 dark:bg-gray-800 text-blue-600 dark:text-white"
            class="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200"
          >
            <mat-icon>{{ item.icono }}</mat-icon>
            <span *ngIf="!collapsed || hovering">{{ item.nombreItem }}</span>
          </a>
        </ng-container>
      </nav>
    </aside>
  `,
  styles: [`
    .active-link mat-icon {
      color: #2563eb;
    }
    .group-open mat-icon {
      color: #2563eb;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed: boolean = false;
  hovering = false;
  menuItems: IMenuItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(private menuService: MenuService) {}

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
