// src/app/shared/components/table/table.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Interface for defining table columns.
 */
export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  align?: 'left' | 'center' | 'right';
  width?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th *ngFor="let col of columns"
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                [ngClass]="getColHeaderClasses(col)"
            >
              {{ col.label }}
            </th>
            <th *ngIf="showActions" scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          <ng-container *ngIf="!loading">
            <tr *ngFor="let row of data"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                (click)="onRowClick(row)"
                [ngClass]="{'bg-blue-50 dark:bg-blue-900/20': isRowSelected(row)}"
            >
              <td *ngFor="let col of columns"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                  [ngClass]="getColCellClasses(col)"
              >
                <!-- Render cell content based on key -->
                {{ row[col.key] }}
              </td>
              <td *ngIf="showActions" class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <ng-content select="[tableActions]" [context]="{$implicit: row}"></ng-content>
              </td>
            </tr>
            <tr *ngIf="data.length === 0">
              <td [attr.colspan]="columns.length + (showActions ? 1 : 0)" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No hay datos disponibles.
              </td>
            </tr>
          </ng-container>
          <ng-container *ngIf="loading">
            <tr>
              <td [attr.colspan]="columns.length + (showActions ? 1 : 0)" class="text-center py-8">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <mat-spinner [diameter]="40" class="text-indigo-600 dark:text-indigo-400"></mat-spinner>
                  <span class="text-gray-500 dark:text-gray-400 text-sm">Cargando datos...</span>
                </div>
              </td>
            </tr>
          </ng-container>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    /* No custom styles needed, Tailwind handles it */
  `]
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showActions: boolean = false;
  @Input() selectable: boolean = false;
  @Input() selectedRow: any | null = null;
  @Input() loading: boolean = false;

  @Output() rowSelected = new EventEmitter<any>();

  onRowClick(row: any): void {
    if (this.selectable && !this.loading) {
      this.selectedRow = (this.selectedRow === row) ? null : row;
      this.rowSelected.emit(this.selectedRow);
    }
  }

  isRowSelected(row: any): boolean {
    return this.selectable && this.selectedRow === row;
  }

  getColHeaderClasses(col: TableColumn): { [key: string]: boolean } {
    const classes: { [key: string]: boolean } = {
      'text-center': col.align === 'center',
      'text-right': col.align === 'right'
    };
    if (col.width) {
      classes[col.width] = true;
    }
    return classes;
  }

  getColCellClasses(col: TableColumn): { [key: string]: boolean } {
    const classes: { [key: string]: boolean } = {
      'text-center': col.align === 'center',
      'text-right': col.align === 'right'
    };
    return classes;
  }
}
