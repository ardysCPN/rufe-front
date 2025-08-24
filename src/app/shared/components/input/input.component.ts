// src/app/shared/components/input/input.component.ts

import { Component, Input, Self, Optional, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

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
          [formControl]="control"
          [required]="required"
          [attr.autocomplete]="autocomplete"
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-indigo-500"
          [ngClass]="{'ring-red-500 focus:ring-red-500': control.invalid && (control.dirty || control.touched)}"
        />
        <ng-container *ngIf="control.invalid && (control.dirty || control.touched)">
          <p *ngIf="control.errors?.['required']" class="mt-2 text-sm text-red-600">
            {{ label }} es requerido.
          </p>
          <p *ngIf="control.errors?.['email']" class="mt-2 text-sm text-red-600">
            Por favor, introduce un correo electrónico válido.
          </p>
          <p *ngIf="control.errors?.['minlength']" class="mt-2 text-sm text-red-600">
            {{ label }} debe tener al menos {{ control.errors?.['minlength']?.requiredLength }} caracteres.
          </p>
          <p *ngIf="control.errors?.['maxlength']" class="mt-2 text-sm text-red-600">
            {{ label }} no debe exceder los {{ control.errors?.['maxlength']?.requiredLength }} caracteres.
          </p>
          <p *ngIf="control.errors?.['pattern']" class="mt-2 text-sm text-red-600">
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
export class InputComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() autocomplete: string = 'off';
  @Input() id: string = '';
  @Input() name: string = '';

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
