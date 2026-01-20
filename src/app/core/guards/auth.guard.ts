// src/app/core/guards/auth.guard.ts

/**
 * AuthGuard para proteger rutas en la aplicación.
 * 
 * Este guard verifica si el usuario está autenticado y si su token es válido.
 * Permite el acceso en los siguientes casos:
 *   - Si el usuario está online y tiene un token válido (verificado con el backend).
 *   - Si el usuario está offline y existe una sesión offline válida (último usuario logueado).
 * 
 * Si ninguna de estas condiciones se cumple, redirige al usuario a la página de login y muestra un mensaje informativo.
 * 
 * Lógica principal:
 * - Si el usuario está offline, permite el acceso solo si existe el email del último usuario logueado y el flag de sesión offline.
 * - Si el usuario está online y tiene token, valida el token con el backend.
 * - Si el token es inválido, expirado o hay error de validación, redirige al login.
 * - Si no hay usuario ni token, redirige al login.
 */

import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar'; // Para notificaciones
import { of } from 'rxjs';
import { NetworkService } from '../services/network.service'; // Servicio de red

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const networkService = inject(NetworkService);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Toma el valor actual del usuario y lo mapea a un booleano
  return authService.currentUser.pipe(
    take(1), // Solo toma la primera emisión y luego completa
    switchMap(user => {
      // Permitir acceso si hay sesión offline activa
      let lastUserEmail: string | null = null;
      let isOfflineSession = false;

      if (isBrowser) {
        lastUserEmail = localStorage.getItem('lastLoggedUserEmail');
        isOfflineSession = localStorage.getItem('isOfflineSession') === 'true';
      }

      if (!networkService.isOnline || isOfflineSession) {
        if (lastUserEmail && isOfflineSession) {
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

      // Modo online: valida el token con el backend
      if (user && user.token) {
        return authService.validateTokenAndKeepAlive().pipe(
          map(isValid => {
            if (isValid) {
              return true; // Token válido, permite acceso
            } else {
              // Token inválido/expirado, redirige al login
              snackBar.open('Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.', 'Cerrar', {
                duration: 5000,
                panelClass: ['snackbar-error']
              });
              router.navigate(['/login']);
              return false;
            }
          }),
          catchError(() => {
            // Error al validar el token (por ejemplo, backend caído)
            if (user?.email && lastUserEmail && user.email === lastUserEmail) {
              snackBar.open('No se pudo validar la sesión con el servidor, pero puedes trabajar como el último usuario logueado.', 'Cerrar', {
                duration: 5000,
                panelClass: ['snackbar-success']
              });
              if (isBrowser) {
                localStorage.setItem('isOfflineSession', 'true');
              }
              return of(true);
            } else {
              snackBar.open('Error al validar la sesión. Por favor, inicia sesión de nuevo.', 'Cerrar', {
                duration: 5000,
                panelClass: ['snackbar-error']
              });
              router.navigate(['/login']);
              return of(false);
            }
          })
        );
      } else {
        // No hay usuario ni token, redirige al login
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

