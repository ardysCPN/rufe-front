// src/app/features/auth/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Still useful for loading
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Still useful for notifications

import { AuthService } from '../../../core/services/auth.service';
import { ILoginCredentials } from '../../../core/models/auth.model';
import { NetworkService } from '../../../core/services/network.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
    // Removed MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule
    // as the template now uses plain HTML elements with Tailwind CSS.
  ],
  template: `
    <div class="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-100 dark:bg-gray-900">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          class="mx-auto h-10 w-auto rounded-full shadow-md"
          src="https://placehold.co/100x100/3b82f6/ffffff?text=RUFE"
          alt="RUFE Logo"
        />
        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
          Iniciar sesión en tu cuenta
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-200">Correo electrónico</label>
            <div class="mt-2">
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                required
                class="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-base text-gray-900 dark:text-white outline outline-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-600"
              />
              <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="mt-2 text-sm text-red-600">
                Por favor, introduce un correo electrónico válido.
              </p>
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-200">Contraseña</label>
              <div class="text-sm">
                <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">¿Olvidaste tu contraseña?</a>
              </div>
            </div>
            <div class="mt-2">
              <input
                id="password"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-base text-gray-900 dark:text-white outline outline-1 outline-gray-300 dark:outline-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-600"
              />
              <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="mt-2 text-sm text-red-600">
                La contraseña es obligatoria.
              </p>
            </div>
          </div>



          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 relative"
            >
              <mat-spinner *ngIf="loading" [diameter]="20" class="absolute left-1/2 -translate-x-1/2"></mat-spinner>
              <span [class.opacity-0]="loading">Iniciar sesión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Custom styles for spinner positioning if needed, though Tailwind classes handle most of it */
    .mat-mdc-progress-spinner {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private networkService: NetworkService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const { email, password } = this.loginForm.value as ILoginCredentials;

    if (!this.networkService.isOnline) {
      const lastUserEmail = localStorage.getItem('lastLoggedUserEmail');
      if (lastUserEmail && lastUserEmail === email) {
        this.snackBar.open('Acceso offline permitido para el último usuario logueado.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        localStorage.setItem('isOfflineSession', 'true');
        this.router.navigate(['/dashboard']);
      } else {
        this.snackBar.open('Sin conexión. Solo el último usuario logueado puede acceder.', 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
      }
      return; // <-- Aquí se detiene el flujo y NO llama al backend
    }

    // Solo intenta login online si hay conexión
    this.loading = true;
    this.authService.login({ email, password }).subscribe({
      next: (user) => {
        localStorage.setItem('lastLoggedUserEmail', email);
        this.snackBar.open(`¡Bienvenido, ${user.nombre}!`, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        let errorMessage = 'Error al iniciar sesión.';

        // Si el error es el objeto personalizado
        if (err && err.user) {
          errorMessage = err.user;
          // Si es error de red y el email coincide, permite acceso offline
          if (err.status === 0) {
            const lastUserEmail = localStorage.getItem('lastLoggedUserEmail');
            if (lastUserEmail && lastUserEmail === email) {
              this.snackBar.open(
                'No se pudo conectar con el servidor, pero puedes trabajar en modo offline como el último usuario logueado.',
                'Cerrar',
                { duration: 5000, panelClass: ['snackbar-success'] }
              );
              localStorage.setItem('isOfflineSession', 'true');
              this.router.navigate(['/dashboard']);
              return;
            }
          }
          // Imprime el error técnico solo en consola
          console.error('Login error:', err.technical);
        } else {
          // Fallback para errores no controlados
          console.error('Login error:', err);
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }


      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
