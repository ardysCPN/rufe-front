// src/app/features/auth/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { ILoginCredentials } from '../../../core/models/auth.model';
import { NetworkService } from '../../../core/services/network.service';
import { PwaService } from '../../../core/services/pwa.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-100 dark:bg-gray-950">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <div class="flex flex-col items-center">
          <div class="p-4 bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 mb-6">
            <img
              class="h-16 w-auto rounded-2xl"
              src="https://rufe.adhsolutions.tech/social-preview.png"
              alt="RUFE Logo"
            />
          </div>
          <h2 class="text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            RUFE
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Registro Unifamiliar de Emergencias</p>
        </div>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <div class="bg-white dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
          <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Correo electrónico</label>
              <div class="mt-2">
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  placeholder="ejemplo@usuario.com"
                  required
                  class="block w-full rounded-xl bg-gray-50/50 dark:bg-gray-800/50 px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
              </div>
              <div class="mt-2">
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  required
                  class="block w-full rounded-xl bg-gray-50/50 dark:bg-gray-800/50 px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loginForm.invalid || loading"
              class="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all active:scale-95 disabled:opacity-50"
            >
              <mat-spinner *ngIf="loading" [diameter]="20" class="absolute left-1/2 -translate-x-1/2"></mat-spinner>
              <span [class.opacity-0]="loading" class="flex items-center gap-2">
                Ingresar <span class="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </form>

          <!-- PWA Installation Section -->
          <div *ngIf="showInstallButton || showIosInstructions" class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
            <!-- Android / Desktop Desktop -->
            <div *ngIf="showInstallButton" class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
              <div class="flex items-center gap-3 mb-3">
                <div class="p-2 bg-blue-600 rounded-lg">
                   <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-blue-900 dark:text-blue-100">Instalar Aplicación</h3>
                  <p class="text-xs text-blue-700 dark:text-blue-300">Accede más rápido desde tu escritorio</p>
                </div>
              </div>
              <button 
                (click)="installPwa()"
                class="w-full bg-white dark:bg-blue-600 text-blue-600 dark:text-white text-xs font-bold py-2 rounded-xl shadow-sm hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors border border-blue-200 dark:border-transparent">
                Instalar ahora
              </button>
            </div>

            <!-- iOS Instructions -->
            <div *ngIf="showIosInstructions" class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
              <div class="flex items-center gap-3 mb-3">
                <div class="p-2 bg-indigo-600 rounded-lg">
                   <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-indigo-900 dark:text-indigo-100">Instalar en tu iPhone</h3>
                  <p class="text-xs text-indigo-700 dark:text-indigo-300">Sigue estos pasos para instalar:</p>
                </div>
              </div>
              <div class="space-y-2 text-xs text-indigo-800 dark:text-indigo-200 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                <p class="flex items-center gap-2">1. Toca el botón <strong>Compartir</strong> <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg></p>
                <p class="flex items-center gap-2">2. Desliza y elige <strong>"Agregar al inicio"</strong> <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></p>
              </div>
            </div>
          </div>
        </div>
        
        <p class="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
           RUFE v2.0 - © {{currentYear}} ADH SOLUTIONS
        </p>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showInstallButton = false;
  showIosInstructions = false;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private networkService: NetworkService,
    private pwaService: PwaService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.initPwaLogic();
  }

  private initPwaLogic() {
    if (this.pwaService.isStandalone()) return;

    if (this.pwaService.isIos()) {
      this.showIosInstructions = true;
    } else {
      this.pwaService.canInstall$.subscribe(canInstall => {
        this.showInstallButton = canInstall;
      });
    }
  }

  installPwa() {
    this.pwaService.installPwa();
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
      return;
    }

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

        if (err && err.user) {
          errorMessage = err.user;
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
          console.error('Login error:', err.technical);
        } else {
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
