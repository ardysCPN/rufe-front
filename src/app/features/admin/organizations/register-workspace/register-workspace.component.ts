// src/app/features/admin/organizations/register-workspace/register-workspace.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Import reusable components
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
// import { CardComponent } from '../../../../shared/components/card/card.component'; // If you create a CardComponent

@Component({
  selector: 'app-register-workspace',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,     // Use the reusable InputComponent
    ButtonComponent,    // Use the reusable ButtonComponent
    // CardComponent // If you create a CardComponent
  ],
  template: `
    <div class="sm:mx-auto sm:max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Registrar nuevo espacio de trabajo
      </h3>
      <p class="mt-1 text-base leading-6 text-gray-600 dark:text-gray-300">
        Tómate unos minutos para registrar el espacio de trabajo de tu empresa.
      </p>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8">
        <div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div class="col-span-full sm:col-span-3">
            <app-input
              label="Nombre"
              id="first-name"
              name="first-name"
              type="text"
              placeholder="Nombre"
              [required]="true"
              autocomplete="given-name"
              formControlName="firstName"
            ></app-input>
          </div>
          <div class="col-span-full sm:col-span-3">
            <app-input
              label="Apellido"
              id="last-name"
              name="last-name"
              type="text"
              placeholder="Apellido"
              [required]="true"
              autocomplete="family-name"
              formControlName="lastName"
            ></app-input>
          </div>
          <div class="col-span-full">
            <app-input
              label="Correo electrónico"
              id="email"
              name="email"
              type="email"
              placeholder="Correo electrónico"
              [required]="true"
              autocomplete="email"
              formControlName="email"
            ></app-input>
          </div>
          <div class="col-span-full">
            <app-input
              label="Dirección"
              id="address"
              name="address"
              type="text"
              placeholder="Dirección"
              autocomplete="street-address"
              formControlName="address"
            ></app-input>
          </div>
          <div class="col-span-full sm:col-span-2">
            <app-input
              label="Ciudad"
              id="city"
              name="city"
              type="text"
              placeholder="Ciudad"
              autocomplete="address-level2"
              formControlName="city"
            ></app-input>
          </div>
          <div class="col-span-full sm:col-span-2">
            <app-input
              label="Estado/Provincia"
              id="state"
              name="state"
              type="text"
              placeholder="Estado/Provincia"
              autocomplete="address-level1"
              formControlName="state"
            ></app-input>
          </div>
          <div class="col-span-full sm:col-span-2">
            <app-input
              label="Código Postal"
              id="postal-code"
              name="postal-code"
              type="text"
              placeholder="Código Postal"
              autocomplete="postal-code"
              formControlName="postalCode"
            ></app-input>
          </div>
        </div>

        <!-- Divider (simple div with Tailwind) -->
        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        <div class="flex items-center justify-end space-x-4">
          <app-button type="button" color="basic" customClasses="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Cancelar
          </app-button>
          <app-button type="submit" color="primary" [loading]="loading" [disabled]="registerForm.invalid">
            Enviar
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    /* Any specific styles for this component if needed */
  `]
})
export class RegisterWorkspaceComponent implements OnInit {
  registerForm: FormGroup;
  loading: boolean = false;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      city: [''],
      state: [''],
      postalCode: ['']
    });
  }

  ngOnInit(): void {
    // Initialization logic if any
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      console.log('Formulario de registro enviado:', this.registerForm.value);
      // Simulate API call
      setTimeout(() => {
        this.loading = false;
        alert('Registro exitoso!');
        this.registerForm.reset();
      }, 2000);
    } else {
      this.registerForm.markAllAsTouched();
      console.warn('Formulario inválido. Por favor, revisa los campos.');
    }
  }
}
