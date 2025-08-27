// src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar'; // For notifications
import { of } from 'rxjs';
import { NetworkService } from '../services/network.service'; // Importa el servicio de red

/**
 * AuthGuard to protect routes.
 * Checks if the user is authenticated and if their token is still valid.
 */
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const networkService = inject(NetworkService);

  // Take the current user value and then map it to a boolean
  return authService.currentUser.pipe(
    take(1), // Take only the first emission and then complete
    switchMap(user => {
      if (!networkService.isOnline) {
        const lastUserEmail = localStorage.getItem('lastLoggedUserEmail');
        if (lastUserEmail) {
          return of(true);
        } else {
          snackBar.open('Solo el último usuario logueado puede trabajar sin conexión.', 'Cerrar', {
            duration: 4000,
            panelClass: ['snackbar-error']
          });
          router.navigate(['/login']);
          return of(false);
        }
      }

      if (user && user.token) {
        // User is logged in, now validate the token with the backend (or local check)
        return authService.validateTokenAndKeepAlive().pipe(
          map(isValid => {
            if (isValid) {
              return true; // Token is valid, allow access
            } else {
              // Token invalid/expired after validation attempt, AuthService.logout() should have been called
              snackBar.open('Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.', 'Cerrar', {
                duration: 5000,
                panelClass: ['snackbar-error']
              });
              router.navigate(['/login']); // Ensure navigation to login
              return false;
            }
          }),
          catchError(() => {
            // Error during validation (e.g., network error, backend down)
            snackBar.open('Error al validar la sesión. Por favor, inicia sesión de nuevo.', 'Cerrar', {
              duration: 5000,
              panelClass: ['snackbar-error']
            });
            router.navigate(['/login']);
            return of(false);
          })
        );
      } else {
        // No user or token found, redirect to login
        snackBar.open('Debes iniciar sesión para acceder a esta página.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-warn']
        });
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};

