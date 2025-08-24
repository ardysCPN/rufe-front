// src/app/shared/components/button/button.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Keep for spinner, it's a visual utility

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule // Still useful for loading state
  ],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [ngClass]="getButtonClasses()"
    >
      <mat-spinner *ngIf="loading" [diameter]="20" class="mr-2"></mat-spinner>
      <ng-content *ngIf="!loading"></ng-content> <!-- Content projected here -->
    </button>
  `,
  styles: [`
    /* Minimal styles, primarily for spinner alignment */
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      transition: all 0.2s ease-in-out;
    }
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'basic' = 'primary'; // Renamed color to variant
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() customClasses: string = ''; // For additional Tailwind classes

  getButtonClasses(): string {
    let classes = 'rounded-md px-4 py-2 text-sm font-semibold leading-6 shadow-sm';

    switch (this.variant) {
      case 'primary':
        classes += ' bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
        break;
      case 'secondary':
        classes += ' bg-gray-600 text-white hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600';
        break;
      case 'danger':
        classes += ' bg-red-600 text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600';
        break;
      case 'basic': // For buttons like "Cancel"
        classes += ' bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700';
        break;
    }

    if (this.disabled || this.loading) {
      classes += ' opacity-50 cursor-not-allowed';
    }

    return `${classes} ${this.customClasses}`;
  }
}
