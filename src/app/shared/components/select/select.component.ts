// src/app/shared/components/select/select.component.ts

import { Component, Input, Self, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ICatalogoItemResponse } from '../../../models/catalogs.model';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div>
      <label [htmlFor]="id" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <div class="mt-2">
        <div class="relative">
          <select
            [id]="id"
            [name]="name"
            [formControl]="control"
            [required]="required"
            [disabled]="loadingOptions"
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-indigo-500"
            [ngClass]="{'ring-red-500 focus:ring-red-500': control.invalid && (control.dirty || control.touched), 'opacity-50 cursor-not-allowed': loadingOptions}"
          >
            <option value="" disabled selected *ngIf="showDefaultOption || loadingOptions">
              {{ loadingOptions ? 'Cargando...' : defaultOptionText }}
            </option>
            <option *ngFor="let option of options" [value]="option.id">
              {{ option.nombre }}
            </option>
          </select>
          <div *ngIf="loadingOptions" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <mat-spinner [diameter]="20" class="text-indigo-600 dark:text-indigo-400"></mat-spinner>
          </div>
        </div>

        <ng-container *ngIf="control?.invalid && (control?.dirty || control?.touched)">
          <p *ngIf="control?.errors?.['required']" class="mt-2 text-sm text-red-600">
            {{ label }} es requerido.
          </p>
          <ng-content select="[customError]"></ng-content>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    /* No additional styles needed, Tailwind handles it */
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() required: boolean = false;
  @Input() options: ICatalogoItemResponse[] = [];
  @Input() showDefaultOption: boolean = true;
  @Input() defaultOptionText: string = 'Selecciona una opción';
  @Input() loadingOptions: boolean = false; // NEW: loading state for options

  control!: FormControl<any>;

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (this.ngControl && this.ngControl.control) {
      this.control = this.ngControl.control as FormControl;
      if (this.required) {
        this.control.addValidators(Validators.required);
      }
    } else {
      // Fallback for standalone usage
      this.control = new FormControl('');
      if (this.required) {
        this.control.addValidators(Validators.required);
      }
    }
  }

  // ControlValueAccessor methods
  writeValue(obj: any): void {
    this.control?.setValue(obj, { emitEvent: false });
  }
  registerOnChange(fn: any): void {
    this.control?.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.control?.statusChanges.subscribe(() => fn());
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control?.disable() : this.control?.enable();
  }
}
