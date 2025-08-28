// src/app/shared/components/input/input.component.ts

import { Component, Input, Self, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div>
      <label [htmlFor]="id" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <div class="mt-2">
        <input
          [id]="id"
          [name]="name"
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [required]="required"
          [attr.autocomplete]="autocomplete"
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-indigo-500"
          [ngClass]="{'ring-red-500 focus:ring-red-500': ngControl?.invalid && (ngControl?.dirty || ngControl?.touched)}"
        />
        <ng-container *ngIf="ngControl?.invalid && (ngControl?.dirty || ngControl?.touched)">
          <p *ngIf="ngControl?.errors?.['required']" class="mt-2 text-sm text-red-600">
            {{ label }} es requerido.
          </p>
          <p *ngIf="ngControl?.errors?.['email']" class="mt-2 text-sm text-red-600">
            Por favor, introduce un correo electrónico válido.
          </p>
          <p *ngIf="ngControl?.errors?.['minlength']" class="mt-2 text-sm text-red-600">
            {{ label }} debe tener al menos {{ ngControl?.errors?.['minlength']?.requiredLength }} caracteres.
          </p>
          <p *ngIf="ngControl?.errors?.['maxlength']" class="mt-2 text-sm text-red-600">
            {{ label }} no debe exceder los {{ ngControl?.errors?.['maxlength']?.requiredLength }} caracteres.
          </p>
          <p *ngIf="ngControl?.errors?.['pattern']" class="mt-2 text-sm text-red-600">
            Formato inválido para {{ label }}.
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
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() autocomplete: string = 'off';
  @Input() id: string = '';
  @Input() name: string = '';

  value: any = '';
  disabled = false;
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl | null) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }
  
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
  }

  // ControlValueAccessor methods
  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
